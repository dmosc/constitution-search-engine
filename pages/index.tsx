import {
  ArrowsAltOutlined,
  LoadingOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { Button, Card, Row, Col, message, Tooltip, Badge } from "antd";
import { Types } from "mongoose";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArticleType, UserType } from "types/models";
import ErrorManager from "utils/error-manager";
import styles from "./index.module.css";

let timeoutId: number;

const Home: NextPage = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [matchedWords, setMatchedWords] = useState<string[]>();
  const [starredArticles, setStarredArticles] = useState<Set<Types.ObjectId>>();
  const [isSaving, setIsSaving] = useState<Types.ObjectId>();

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      fetch(router.query.q ? `/api/query?q=${router.query.q}` : "/api/query")
        .then((res) => res.json())
        .then((res) => {
          if (!router.query.q) {
            let arts = res.articles as [ArticleType];
            setArticles(
              arts.sort((a: ArticleType, b: ArticleType): number => {
                if (a.views > b.views) {
                  return -1;
                } else if (a.views < b.views) {
                  return 1;
                } else {
                  return 0;
                }
              })
            );
          } else {
            setArticles(res.articles);
          }
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

  let updateArticleViews = (articleId: Types.ObjectId) => {
    fetch("/api/increase-article-views", {
      method: "POST",
      body: JSON.stringify({
        articleId: articleId,
      }),
    });
  };

  return (
    <div className={styles.container}>
      {articles.map((article) => {
        let iconToRender;
        if (isSaving === article._id) {
          iconToRender = <LoadingOutlined />;
        } else {
          if (starredArticles?.has(article._id)) {
            iconToRender = <StarFilled />;
          } else {
            iconToRender = <StarOutlined />;
          }
        }
        const displayViews = article.views > 0;
        return (
          <Card
            title={article.name}
            key={String(article.codeName)}
            // TODO: Replace scroll overflow for a modal.
            style={{ maxHeight: "25vh", overflow: "auto" }}
            extra={
              <Row gutter={[5, 0]}>
                {displayViews ? (
                  <Col span={6}>
                    <Tooltip title={`${article.views} búsquedas recientes`}>
                      <Badge
                        count={article.views > 0 ? `${article.views}` : "0"}
                      />
                    </Tooltip>
                  </Col>
                ) : null}
                <Col span={displayViews ? 6 : 8}>
                  <Button
                    type="primary"
                    icon={<ArrowsAltOutlined />}
                    onClick={() => {
                      updateArticleViews(article._id);
                      router.push(`/articles/${article._id}`);
                    }}
                  />
                </Col>
                <Col span={displayViews ? 6 : 8}>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.host}/articles/${article._id}`
                      );
                      message.info("¡Link copiado al portapapeles!");
                    }}
                  />
                </Col>
                <Col span={displayViews ? 6 : 8}>
                  <Button
                    type="dashed"
                    disabled={!!isSaving}
                    icon={iconToRender}
                    onClick={() => {
                      setIsSaving(article._id);
                      const starredArticlesToSet = new Set(starredArticles);
                      if (starredArticlesToSet?.has(article._id)) {
                        starredArticlesToSet.delete(article._id);
                      } else {
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
                        })
                        .finally(() => {
                          setIsSaving(undefined);
                        });
                    }}
                  />
                </Col>
              </Row>
            }
          >
            <div id={String(article.codeName)}>{article.content}</div>
          </Card>
        );
      })}
    </div>
  );
};

export default Home;
