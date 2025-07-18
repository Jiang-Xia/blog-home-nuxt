# docker pull node
# 不加: 使用本地node
FROM node:20.17.0
ENV NODE_ENV=production
# 工作根目录
WORKDIR /app 
# 把除了.dockerignore中的文件拷贝到/app中
# COPY . /app
RUN ls
RUN npm config set registry https://registry.npmmirror.com
RUN npm config list

# !天坑 一定要加上--include=dev不然只会安装package.json中dependencies的依赖
# RUN npm install --include=dev

RUN npm list

# RUN npm run build

# 文件名不能有点,注意目标文件夹，不对运行会报错
COPY ./output ./output

CMD [ "node", "output/server/index.mjs"]

EXPOSE 5050:3000


# docker image build -t blog-server .
# 登录docker docker login -u 963798512@qq.com -p j123456