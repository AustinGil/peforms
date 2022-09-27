import path from 'node:path';
import Fastify from 'fastify';
import FastifyStatic from 'fastify-static';
import FastifyFormbody from 'fastify-formbody';
import FastifyMultipart from 'fastify-multipart';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const fastify = Fastify({
  logger: true,
});
fastify.register(FastifyStatic, {
  root: __dirname,
});
fastify.register(FastifyFormbody);
fastify.register(FastifyMultipart, {
  addToBody: true,
});

fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});
fastify.all('/api', async (request, reply) => {
  console.log(request.body);

  if (request.headers['sec-fetch-mode'] === 'navigate') {
    // Request submitted with HTML form
    return reply.redirect(303, request.headers.referer);
  }
  return { hello: 'world' };
});

const start = async () => {
  try {
    await fastify.listen(3000);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
