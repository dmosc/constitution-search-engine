import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./navbar.module.css";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User>();
  const { data: session } = useSession();
  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);
  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          className={styles.searchInput}
          placeholder="Busca cualquier palabra o ley de la constitución mexicana"
        />
      </div>
      <div className={styles.avatarContainer}>
        <div className={styles.nameContainer}>
          <div style={{ fontSize: 12 }}>Hola, </div>
          <div className={styles.name}>{user?.email?.split("@")[0]}</div>
        </div>
        <Image
          src={user?.image! ?? "/favicon.ico"} // TODO: Get a nicer placeholder.
          width="30%"
          height="30%"
          layout="fixed"
          alt="Profile image"
          className={styles.avatar}
        />
      </div>
    </div>
  );
};

export default Navbar;
