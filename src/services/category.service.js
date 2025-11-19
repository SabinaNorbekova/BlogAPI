import { trim } from 'zod'
import {prisma} from '../prisma/prisma.js'

export const CategoryService={
    async create(data){
        return await prisma.category.create({
            data:{
                name: data.name.trim(),
                description:data.description?.trim()
            },
        })
    },
    
    async getAll(){
        return await prisma.category.findMany({
            orderBy:{name: 'asc'},
            select: {
                id:true,
                name:true,
                description:true,
                createdAt:true
            }
        })
    },

    async getById(id){
        const category=await prisma.category.findUnique({
            where:{id},
        })
        if(!category) throw {status:404, message:'Category topilmadi'}
        return category
    },

    async update(id, data){
        return await prisma.category.update({
            where:{id},
            data:{
                name:data.name?.trim(),
                description:data.description?.trim()
            }
        })
    },

    async delete(id){
        await prisma.category.delete({where:{id}})
        return {message: 'Category o`chirildi'}
    }
}