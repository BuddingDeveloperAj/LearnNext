"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "./mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    await connectToDatabase();
    const { content, author, question, path } = params;

    const newAnwer = await Answer.create({
      content,
      author,
      question,
    });

    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnwer._id },
    });

    // TODO: to add reputation

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    await connectToDatabase();
    const { sortBy } = params;

    let sortOptions = {};
    switch (sortBy) {
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }

    const answers = await Answer.find({ question: params.questionId })
      .populate("author", "_id clerkId name picture")
      .sort(sortOptions);

    return { answers };
  } catch (error) {
    console.log(error);
  }
};

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDatabase();

    const { answerId, userId, hasDownvoted, hasUpvoted, path } = params;

    let updateQuery = {};

    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDatabase();

    const { answerId, userId, hasDownvoted, hasUpvoted, path } = params;

    let updateQuery = {};

    if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    await connectToDatabase();
    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);
    await Question.findByIdAndUpdate(
      { _id: answer.question },
      {
        $pull: { answers: answerId },
      }
    );
    await Interaction.deleteMany({ answer: answerId });
    await Answer.findByIdAndDelete(answerId);

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}
