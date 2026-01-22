import { RouteNamesEnum } from 'localConstants';
import { Dashboard, Disclaimer, Home, Validate } from 'pages';
import { FestivalInfo } from 'pages/Festival';
import { FestivalsList } from 'pages/Festivals';
import AvailableTicketsPage from 'pages/Tickets/AvailableTickets';
import { ResaleMarketplace } from 'pages/Resale';
import { CheckIn } from 'pages/CheckIn';
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
    path: RouteNamesEnum.festivals,
    title: 'All Festivals',
    component: FestivalsList
  },
  {
    path: RouteNamesEnum.festival,
    title: 'Festival Info',
    component: FestivalInfo
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
    title: 'Buy Tickets',
    component: AvailableTicketsPage
  },
  {
    path: RouteNamesEnum.resale,
    title: 'Resale Marketplace',
    component: ResaleMarketplace
  },
  {
    path: RouteNamesEnum.checkin,
    title: 'Check-In',
    component: CheckIn
  },
  {
    path: RouteNamesEnum.validate,
    title: 'Validate Tickets',
    component: Validate
  }
];
