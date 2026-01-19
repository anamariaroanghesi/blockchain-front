import { RouteNamesEnum } from 'localConstants';
import { Dashboard, Disclaimer, Home } from 'pages';
import AvailableTicketsPage from 'pages/Tickets/AvailableTickets';
import { Validate } from 'pages/Validate';
import { RouteType } from 'types';

interface RouteWithTitleType extends RouteType {
  title: string;
}

export const routes: RouteWithTitleType[] = [
  {
    path: RouteNamesEnum.home,
    title: 'Home',
    component: Home
  },
  {
    path: RouteNamesEnum.dashboard,
    title: 'My Tickets',
    component: Dashboard
  },
  {
    path: RouteNamesEnum.disclaimer,
    title: 'Disclaimer',
    component: Disclaimer
  },
  {
    path: RouteNamesEnum.tickets,
    title: 'Events',
    component: AvailableTicketsPage
  },
  {
    path: RouteNamesEnum.validate,
    title: 'Validate Tickets',
    component: Validate
  }
];
