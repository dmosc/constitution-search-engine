import { DownOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Input, Menu, Typography } from "antd";
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./navbar.module.css";

const { Text } = Typography;

const Navbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const { data: session } = useSession();
  const [query, setQuery] = useState<string>();

  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  }, [session]);

  useEffect(() => {
    const queryToSet = { ...router.query };
    if (query) {
      queryToSet.q = query;
    } else {
      delete queryToSet.q;
    }
    router.replace({ query: queryToSet }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <Input.Search
          className={styles.searchInput}
          placeholder="Qué quieres saber?"
          onSearch={(value) => setQuery(value)}
        />
      </div>
      <Dropdown
        trigger={["click"]}
        overlay={
          <Menu
            mode="vertical"
            items={[
              {
                label: "Sesión",
                key: Math.random(),
                type: "group",
                children: [
                  {
                    label: "Salir",
                    key: Math.random(),
                    onClick: () => signOut()
                  }
                ]
              }
            ]}
          />
        }
      >
        <Button className={styles.avatarContainer} type="text">
          <Avatar style={{ marginRight: 15 }} size={35} src={user?.image} />
          <div className={styles.nameContainer}>
            <Text style={{ fontSize: 12 }} type="secondary">
              Hola,
            </Text>
            <Text style={{ marginTop: -5 }} strong>
              {user?.email?.split("@")[0]}
            </Text>
          </div>
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
};

export default Navbar;
