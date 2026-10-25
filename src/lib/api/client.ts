import { Client } from "as2mca-api";

const baseUrl = import.meta.env.VITE_AS2MCA_API_URL;

export const client = new Client(baseUrl);
