import { BookOutlined, SearchOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useRouter } from "next/router";

const MENU_ITEMS = [
  {
    key: "/",
    path: "/",
    label: "Buscar artículos",
    icon: <SearchOutlined />
  },
  {
    key: "/saved",
    path: "/saved",
    label: "Guardados",
    icon: <BookOutlined />
  }
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  return (
    <Layout.Sider theme="dark" breakpoint="lg" collapsedWidth="80" collapsible>
      <Menu
        defaultSelectedKeys={[router.route]}
        theme="dark"
        style={{ padding: 10 }}
        items={MENU_ITEMS.map((item) => ({
          ...item,
          onClick: () => router.push(item.path)
        }))}
      />
    </Layout.Sider>
  );
};

export default Sidebar;
