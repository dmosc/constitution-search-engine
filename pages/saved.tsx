import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { Types } from "mongoose";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArticleType, UserType } from "types/models";
import ErrorManager from "utils/error-manager";
import styles from "./index.module.css";

let timeoutId: number;

const Saved: NextPage = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [matchedWords, setMatchedWords] = useState<string[]>();
  const [starredArticles, setStarredArticles] = useState<Set<Types.ObjectId>>();

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      fetch(
        router.query.q
          ? `/api/query?q=${router.query.q}&starred=true`
          : "/api/query?starred=true"
      )
        .then((res) => res.json())
        .then((res) => {
          setArticles(res.articles);
          setMatchedWords(res.matchedWords);
        })
        .catch(ErrorManager.log);
    }, 1500);
    return () => {
      if (clearTimeout) {
        clearTimeout(timeoutId);
      }
    };
  }, [router.query.q]);

  useEffect(() => {
    for (const article of articles) {
      const content = document.getElementById(article.codeName);
      content!.innerHTML = article.content;
      let formattedContent = content!.innerHTML;
      for (const matchWord of matchedWords ?? []) {
        formattedContent = formattedContent.replace(
          matchWord,
          `<mark>${matchWord}</mark>`
        );
      }
      content!.innerHTML = formattedContent;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]);

  useEffect(() => {
    fetch("/api/user.get")
      .then((res) => res.json())
      .then((res: UserType) => {
        setStarredArticles(new Set(res.starredArticles.map(({ _id }) => _id)));
      });
  }, []);

  return (
    <div className={styles.container}>
      {articles.map((article) => (
        <Card
          title={article.name}
          key={String(article.codeName)}
          // TODO: Replace scroll overflow for a modal.
          style={{ maxHeight: "25vh", overflow: "auto" }}
          extra={
            <Button
              type="dashed"
              icon={
                starredArticles?.has(article._id) ? (
                  <StarFilled />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={() => {
                const starredArticlesToSet = new Set(starredArticles);
                if (starredArticlesToSet?.has(article._id)) {
                  starredArticlesToSet.delete(article._id);
                } else {
                  starredArticlesToSet?.add(article._id);
                }
                fetch("/api/user.update", {
                  method: "POST",
                  body: JSON.stringify({
                    starredArticles: [...starredArticlesToSet!]
                  })
                })
                  .then((res) => res.json())
                  .then((res: UserType) => {
                    setStarredArticles(
                      new Set(res.starredArticles.map(({ _id }) => _id))
                    );
                  });
              }}
            />
          }
        >
          <div id={String(article.codeName)}>{article.content}</div>
        </Card>
      ))}
    </div>
  );
};

export default Saved;
