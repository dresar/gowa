import client from "../lib/gowaClient";
export const getNewsletters = async () => {
    const r = await client.get("/newsletter");
    return r.data;
};
export const unfollowNewsletter = async (newsletterId) => {
    const r = await client.post(`/newsletter/${newsletterId}/unfollow`);
    return r.data;
};
