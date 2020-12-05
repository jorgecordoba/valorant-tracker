import {getProfiles} from '../../utils/dataLayer'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async ({ query: { dateStart, dateEnd } }, res) => {
  const profiles = await getProfiles(dateStart, dateEnd)
  res.statusCode = 200
  res.json(profiles)
}
