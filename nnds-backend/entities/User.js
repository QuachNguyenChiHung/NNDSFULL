import { EntitySchema } from "typeorm";

const User = new EntitySchema({
    name: 'User',
    tableName: 'Users',
    columns: {
        id: {
            primary: true,
            type: 'uniqueidentifier',
            generated: 'uuid'
        },
        name: {
            type: "nvarchar",
            length: 64,
            nullable: true
        },
        date_of_birth: {
            type: "date",
            nullable: true
        },
        password: {
            type: "nvarchar",
            length: 64,
            nullable: false
        },
        mail: {
            type: "varchar",
            length: 256,
            unique: true,
            nullable: false
        },
        date_created: {
            type: 'datetime',
            createDate: true
        },
        img_link: {
            type: 'nvarchar',
            length: '400',
            nullable: true
        },
        phone_number: {
            type: "varchar",
            length: 20,
            nullable: true
        },
        bio_json: {
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
        role: {
            type: 'varchar',
            enum: ['teacher', 'admin'],
            nullable: false,
            length: 16
        },
        first_time: {
            type: 'bit',
            default: 1
        },
        verified: {
            type: 'bit',
            default: 0
        }
    },
    relations: {
        blogs: {
            type: 'one-to-many',
            target: 'Blog',//entity,
            inverseSide: 'user'//relations
        },
        otp: {
            type: 'one-to-many',
            target: 'OTP',//entity,
            inverseSide: 'otp'//relations
        }
    }
})
export default User