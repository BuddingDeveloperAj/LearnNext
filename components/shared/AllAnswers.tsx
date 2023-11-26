import { AnswerFilters } from "@/constants/filter";
import React from "react";
import Filter from "./Filter";
import { getAnswers } from "@/lib/actions/answer.action";
import Link from "next/link";
import Image from "next/image";
import { formatTime } from "@/lib/utils";
import ParseHTML from "./ParseHTML";

interface Props {
  questionId: string;
  totalAnswers: number;
  userId: string;
  page?: number;
  filter?: number;
}

const AllAnswers = async (params: Props) => {
  const { questionId } = params;
  const result = (await getAnswers({ questionId: JSON.parse(questionId) })) ?? {
    answers: [],
  };

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{params.totalAnswers} Answers</h3>
        <Filter filters={AnswerFilters} />
      </div>
      <div>
        {result.answers.map((answer) => (
          <article className="light-border border-b py-10" key={answer._id}>
            <div className="flex justify-between">
              <div className="mb-5 flex justify-between  sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    width={18}
                    height={18}
                    alt="profile"
                    className="rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700 mt-0.5 line-clamp-1">
                      {answer.author.name}
                      <span className="small-regular text-light400_light500 ml-1 text-xs ">
                        answered {formatTime(answer.createdAt)}
                      </span>
                    </p>
                  </div>
                </Link>
              </div>
              <div className="flex justify-end">VOTING</div>
            </div>
            <div className="text-dark200_light900">
              <ParseHTML data={answer.content} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AllAnswers;