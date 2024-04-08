import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Register for an event",
        tags: ["attendees"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            registrationId: z.number().int(),
          }),
          404: z.object({
            error: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { name, email } = request.body;

      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new BadRequest("Event not found");
      }

      const attendeeFromEmail = await prisma.attendee.findUnique({
        where: {
          eventId_email: {
            eventId,
            email,
          },
        },
      });

      if (attendeeFromEmail) {
        throw new BadRequest("Attendee already registered for this event");
      }

      const amouNtOfAttendeesForEvent = await prisma.attendee.count({
        where: { eventId },
      });

      if (
        event?.maximumAttendees &&
        amouNtOfAttendeesForEvent >= event.maximumAttendees
      ) {
        throw new BadRequest("Event is full");
      }

      const registration = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      });

      return reply.status(201).send({ registrationId: registration.id });
    }
  );
}
