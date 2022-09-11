import { NextPage } from "next";
import styles from "./index.module.css";

// TODO: Change 'hello world'
const Home: NextPage = () => {
  return (
    <div className={styles.grid}>
      <h1 className={styles.gridTitle}>Leyes populares</h1>
      Hello world
    </div>
  );
};

export default Home;
