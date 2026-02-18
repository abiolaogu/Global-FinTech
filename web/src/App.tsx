import { Refine } from "@refinedev/core";
import { Button, Card, Form, Input, List, Typography } from "antd";
import { useState } from "react";
import { authProvider } from "./authProvider";
import { dataProvider } from "./dataProvider";

type Project = {
  id: string;
  name: string;
};

const initialProjects: Project[] = [
  { id: "1", name: "Apollo" },
  { id: "2", name: "Atlas" },
];

export default function App() {
  const [items, setItems] = useState<Project[]>(initialProjects);
  const [form] = Form.useForm();

  return (
    <Refine
      dataProvider={dataProvider}
      authProvider={authProvider}
      resources={[{ name: "users" }, { name: "organizations" }, { name: "projects" }]}
    >
      <Card title="Projects (Refine + Ant Design)">
        <Form
          form={form}
          layout="inline"
          onFinish={(values) => {
            setItems((prev) => [...prev, { id: String(Date.now()), name: values.name }]);
            form.resetFields();
          }}
        >
          <Form.Item name="name" rules={[{ required: true }]}> 
            <Input placeholder="Project name" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form>
        <List
          style={{ marginTop: 16 }}
          dataSource={items}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text>{item.name}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </Refine>
  );
}
