import { StarFilled, StarOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Button, Card, Col, message, Row } from "antd";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../index.module.css";
import { ArticleType, UserType } from "types/models";
import { Types } from "mongoose";

const ArticleDisplay: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<ArticleType>();
  const [starredArticles, setStarredArticles] = useState<Set<Types.ObjectId>>();

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then((res: ArticleType) => {
        setArticle(res);
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/user.get")
      .then((res) => res.json())
      .then((res: UserType) => {
        setStarredArticles(new Set(res.starredArticles.map(({ _id }) => _id)));
      });
  }, []);

  return (
    <div className={styles.container}>
      <Card
        title={article?.name}
        key={String(article?.codeName)}
        // TODO: Replace scroll overflow for a modal.
        style={{ maxHeight: "100vh", overflow: "auto" }}
        extra={
          <Row gutter={[5, 0]}>
            <Col span={12}>
              <Button
                icon={<ShareAltOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.host}/articles/${article?._id}`
                  );
                  message.info("¡Link copiado al portapapeles!");
                }}
              />
            </Col>
            <Col span={12}>
              <Button
                type="dashed"
                icon={
                  article != undefined && starredArticles?.has(article._id) ? (
                    <StarFilled />
                  ) : (
                    <StarOutlined />
                  )
                }
                onClick={() => {
                  const starredArticlesToSet = new Set(starredArticles);
                  if (
                    article != undefined &&
                    starredArticlesToSet?.has(article._id)
                  ) {
                    starredArticlesToSet.delete(article._id);
                  } else if (article != undefined) {
                    starredArticlesToSet?.add(article._id);
                  }
                  fetch("/api/user.update", {
                    method: "POST",
                    body: JSON.stringify({
                      starredArticles: [...starredArticlesToSet!],
                    }),
                  })
                    .then((res) => res.json())
                    .then((res: UserType) => {
                      setStarredArticles(
                        new Set(res.starredArticles.map(({ _id }) => _id))
                      );
                    });
                }}
              />
            </Col>
          </Row>
        }
      >
        <div id={String(article?.codeName)}>{article?.content}</div>
      </Card>
    </div>
  );
};

export default ArticleDisplay;
