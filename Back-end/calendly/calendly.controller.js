// controllers/calendlyController.js
import axios from "axios";
import {
  createCalendlyEventsService,
  getAllPaidInvitees,
} from "../modules/servises.js";
import { handleResponse } from "../utils/responseHandler.js";
import Calendly from "../modules/calendlyModule.js"; // path тохируулн
export const getCalendlyUser = async (req, res) => {
  try {
    const response = await axios.get("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Calendly user:", error.message);
    res.status(500).json({ error: "Failed to fetch Calendly user info" });
  }
};

export const checkPhoneDuplicate = async (req, res) => {
  let { phone, date } = req.query;

  if (!phone || !date) {
    return res.status(400).json({ success: false, message: "Утас болон өдөр шаардлагатай" });
  }

  phone = phone.replace(/\D/g, "");
  if (phone.length === 8) {
    phone = `+976 ${phone.slice(0, 4)} ${phone.slice(4)}`;
  } else if (phone.length === 11 && phone.startsWith("976")) {
    phone = `+976 ${phone.slice(3, 7)} ${phone.slice(7)}`;
  } else if (phone.length === 12 && phone.startsWith("976")) {
    phone = `+976 ${phone.slice(3, 7)} ${phone.slice(7)}`;
  } else if (phone.length === 12 && phone.startsWith("976") === false) {
    return res.status(400).json({ success: false, message: "Монгол дугаар биш байна" });
  }

  try {
    const exists = await Calendly.exists({ phone, date }); // OR date: new Date(date)
    return res.json({ exists: !!exists, normalizedPhone: phone });
  } catch (error) {
    console.error("Phone check error:", error);
    return res.status(500).json({ success: false, message: "Серверийн алдаа" });
  }
};


export const getPaidStatus = async (req, res) => {
  try {
    const getPaidStatus = await getAllPaidInvitees(req);
    handleResponse(
      res,
      getPaidStatus,
      "Successfully fetched all warehouse items",
      "Failed to fetch warehouse items"
    );
  } catch (error) {
    console.error("Error fetching Calendly user:", error.message);
    res.status(500).json({ error: "Failed to fetch Calendly user info" });
  }
};

export const createCalendlyEvents = async (req, res) => {
  try {
    const calendlyEvent = await createCalendlyEventsService(req);
    res.status(200).json({
      success: true,
      data: calendlyEvent,
      message: "Canvas created successfully.",
    });
  } catch (error) {
    console.error("Error creating Calendly event:", error.message);
    res.status(500).json({ error: "Failed to create Calendly event" });
  }
};

export const getAllScheduledEvents = async (req, res) => {
  try {
    const tokens = [process.env.CALENDLY_TOKEN, process.env.CALENDLY_TOKEN_1];

    // Хоёр хэрэглэгчийн мэдээллийг Promise.all ашиглан зэрэг татах
    const allEnrichedEvents = await Promise.all(
      tokens.map(async (token) => {
        try {
          // Step 1: Get user's URI
          const userRes = await axios.get("https://api.calendly.com/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userUri = userRes.data.resource.uri;

          // Step 2: Get scheduled events
          const eventsRes = await axios.get(
            `https://api.calendly.com/scheduled_events?user=${userUri}&count=50&sort=start_time:desc`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const events = eventsRes.data.collection;

          // Step 3: Enrich each event with invitees
          const enrichedEvents = await Promise.all(
            events.map(async (event) => {
              if (event.uri) {
                const eventId = event.uri.split("/").pop();
                try {
                  const inviteesRes = await axios.get(
                    `https://api.calendly.com/scheduled_events/${eventId}/invitees`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  return {
                    ...event,
                    invitees: inviteesRes.data.collection,
                  };
                } catch (err) {
                  console.warn(
                    `Could not fetch invitees for ${eventId}:`,
                    err.message
                  );
                  return {
                    ...event,
                    invitees: [],
                    inviteeFetchError: err.message,
                  };
                }
              }
              return {
                ...event,
                invitees: [],
                note: "Event has no valid URI or invitee data",
              };
            })
          );

          return enrichedEvents;
        } catch (err) {
          console.error(`Error fetching events for one token: ${err.message}`);
          return [];
        }
      })
    );

    // events массивуудыг нэг массив болгон нэгтгэх
    const mergedEvents = allEnrichedEvents.flat();

    // Хариу буцаах
    res.status(200).json({
      total: mergedEvents.length,
      events: mergedEvents,
    });
  } catch (error) {
    console.error("Error fetching all scheduled events:", error.message);
    res.status(500).json({ error: "Failed to fetch all scheduled events" });
  }
};

