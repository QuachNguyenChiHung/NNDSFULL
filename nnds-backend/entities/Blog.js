import { EntitySchema, JoinColumn } from "typeorm";

const Blog = new EntitySchema({
    name: 'Blog',
    tableName: 'Blogs',
    columns: {
        id: {
            primary: true,
            type: 'uniqueidentifier',
            generated: "uuid"
        },
        u_id: {
            type: 'uniqueidentifier'
        },
        blog_title: {
            type: 'nvarchar',
            length: 255,
            nullable: true
        },
        blog_content: {
            type: 'nvarchar',
            length: 'MAX',
            nullable: true,
            transformer: {
                to: (value) => {//value saved TO database
                    try {
                        return JSON.stringify(value)
                    } catch (e) {
                        return "{}"
                    }
                },
                from: (value) => {//value reading FROM database
                    try {
                        return JSON.parse(value)
                    } catch (e) {
                        return {}
                    }
                }
            }
        },
        thumbnail: {
            type: 'nvarchar',
            length: '400',
            nullable: true,
            transformer: {
                from: (value) => {
                    try {
                        return JSON.parse(value)
                    } catch (error) {
                        return {}
                    }
                },
                to: (value) => {
                    try {
                        return JSON.stringify(value)
                    } catch (error) {
                        return "{}"
                    }
                }
            }
        },
        introduction: {
            type: 'nvarchar',
            length: 'MAX',
            nullable: true
        },
        category: {
            type: 'nvarchar',
            length: '20',
            enum: ["study", "news"],
            nullable: true
        },
        created_at: {
            type: 'datetime',
            createDate: true
        }
    },
    relations: {
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'u_id'
            },
            inverseSide: 'blogs'
        }
    }
})
export default Blog