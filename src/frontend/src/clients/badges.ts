import {useQuery} from "@tanstack/react-query";
import {getAvailableBadges, getBadge} from "../http/endpoints";

export function useBadgesQuery() {
  return useQuery(["badges"], () => getAvailableBadges());
}

export function useBadgeQuery(id: number) {
  return useQuery(["badge", id], () => getBadge(id));
}
