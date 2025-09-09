import { DataSpaceStatus } from "@prisma/client";

export const dataSpaces = [
    {
        name: "老挝数据专区",
        description: "老挝数据专区",
        status: DataSpaceStatus.ACTIVE,
        country: "Laos",
    },
    {
        name: "中国-东盟数据专区",
        description: "中国-东盟数据专区",
        status: DataSpaceStatus.ACTIVE,
        country: "China",
    },
];