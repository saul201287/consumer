
const amqp = require("amqplib");

const exchangeName = process.env.AMQP_EXCH || "";
const routingKey = process.env.AMQP_ROUTINGKEY || "";
const options = {
  username: process.env.AMQP_USERNAME,
  password: process.env.AMQP_PASSWORD,
};
const queue = "upchiapas.init.que";

const consumer = async () => {
  const conn = await amqp.connect(
    process.env.AMQP_URL || "amqp://3.227.224.172",
    options
  );
  const ch = await conn.createChannel();
  console.log(
    " [*] Esperando mensajes en la cola %s. Para salir, presiona CTRL+C",
    queue
  );

  await ch.consume(
    queue,
    async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        console.log(" [x] Recibido '%s'", data);
        const body = JSON.stringify({
          idPay: data.idPay,
          product: data.product,
          date: data.date,
          price: data.price,
        });
        console.log(body);
        await fetch("http://localhost:3001/payment/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body
        })
          .then((res) => res.json())
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
        ch.ack(msg);
      } else {
        console.error("El mensaje es nulo");
      }
    },
    { noAck: false }
  );
};


consumer();
