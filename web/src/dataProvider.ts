import type { DataProvider } from "@refinedev/core";

const inMemory = {
  users: [{ id: "1", name: "Ada", email: "ada@example.com" }],
  organizations: [{ id: "1", name: "Acme" }],
  projects: [{ id: "1", name: "Apollo", organization_id: "1" }],
};

export const dataProvider: DataProvider = {
  getList: async ({ resource }) => ({ data: (inMemory as any)[resource] ?? [], total: ((inMemory as any)[resource] ?? []).length }),
  create: async ({ resource, variables }) => {
    const item = { id: String(Date.now()), ...(variables as object) };
    (inMemory as any)[resource] = [...((inMemory as any)[resource] ?? []), item];
    return { data: item as any };
  },
  update: async ({ resource, id, variables }) => ({ data: { id, ...(variables as object) } as any }),
  getOne: async ({ resource, id }) => ({ data: (((inMemory as any)[resource] ?? []).find((i: any) => i.id === id) ?? { id }) as any }),
  deleteOne: async ({ id }) => ({ data: { id } as any }),
  getApiUrl: () => "",
  custom: async () => ({ data: {} }),
};
