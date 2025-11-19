import { prisma } from "../prisma/prisma.js";

export const TagService={
    async create(data){
        return await prisma.tag.create({
            data:{
                name:data.name
            }
        })
    },

    async getAll(){
        return await prisma.tag.findMany({
            orderBy:{name:'asc'},
            select:{
                id:true,
                name:true,
                createdAt:true,
                _count:{
                    select:{posts:true}
                }
            }
        })
    },

    async getById(id) {
        const tag = await prisma.tag.findUnique({
          where: { id },
          include: {
            _count: {
              select: { posts: true } 
            }
          }
        });
      
        if (!tag) {
          throw { status: 404, message: 'Tag topilmadi' };
        }
      
        return tag;
    },

    async update(id, data){
        return await prisma.tag.update({
            where:{id},
            data:{name:data.name}
        })
    },

    async delete(id){
        const usedCount=await prisma.postTag.count({where:{tagId:id}})
        if(usedCount>0){
            throw {status:400, message:`Bu tag ${usedCount} ta postda ishlatilgan. Avval postlardan olib tashlang`}
        }
        await prisma.tag.delete({where:{id}})
        return {message:'Tag o`chirildi'}
    }
}