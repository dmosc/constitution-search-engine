import { NextPage } from "next";
import { useRouter } from 'next/router'

const ArticleDisplay: NextPage = () => {
    const router = useRouter();
    const {articleId} = router.query;

    return (
        <h1>Article ID is: {articleId}</h1>
    );
}

export default ArticleDisplay;