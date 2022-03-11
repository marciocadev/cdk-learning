# Dockerfile

FROM amazon/aws-lambda-nodejs:14

ARG FUNCTION_DIR="/var/task"

RUN mkdir -p ${FUNCTION_DIR}

COPY handler.ts ${FUNCTION_DIR}/

RUN npm init -y
RUN npm install @types/aws-lambda
RUN npm install -g typescript 
RUN tsc handler.ts

CMD [ "handler.run" ]