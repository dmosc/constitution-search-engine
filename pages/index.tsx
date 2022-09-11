import { NextPage } from "next";
import { useState } from "react";
import styles from "./index.module.css";

// TODO: Delete this.
const description =
  "Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen.";
const name = "Ley de prueba";
const tags = ["tag1", "tag2", "tag3"];
const placeholderLaws = [
  { id: "1", name, description, tags },
  { id: "2", name, description, tags },
  { id: "3", name, description, tags },
  { id: "4", name, description, tags },
  { id: "5", name, description, tags },
  { id: "6", name, description, tags },
  { id: "6", name, description, tags },
  { id: "6", name, description, tags },
  { id: "6", name, description, tags },
  { id: "6", name, description, tags },
  { id: "6", name, description, tags }
];

const Home: NextPage = () => {
  const [laws] = useState(placeholderLaws);
  return (
    <div className={styles.grid}>
      <h1 className={styles.gridTitle}>Leyes populares</h1>
      {laws.map((law) => (
        <div key={law.id} className={styles.card}>
          <div className={styles.cardTitle}>{law.name}</div>
          <div className={styles.tagsContainer}>
            {law.tags.map((tag) => (
              <div key={tag} className={styles.tag}>
                {tag}
              </div>
            ))}
          </div>
          <div>{law.description ?? "..."}</div>
        </div>
      ))}
    </div>
  );
};

export default Home;
