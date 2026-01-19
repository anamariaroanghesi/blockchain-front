import { useState } from 'react';
import { Link, useMatch, useLocation } from 'react-router-dom';
import { Button } from 'components/Button';
import { MxLink } from 'components/MxLink';
import { environment } from 'config';
import { logout } from 'helpers';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicket, 
  faWallet, 
  faRightFromBracket,
  faBars,
  faTimes,
  faShieldHalved,
  faHome,
  faCheckCircle,
  faMusic,
  faExchangeAlt,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';

const callbackUrl = `${window.location.origin}/unlock`;
const onRedirect = undefined;
const shouldAttemptReLogin = false;
const options = {
  shouldBroadcastLogoutAcrossTabs: true,
  hasConsentPopup: false
};

const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const Header = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const { address } = useGetAccountInfo();
  const isUnlockRoute = Boolean(useMatch(RouteNamesEnum.unlock));
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    logout(callbackUrl, onRedirect, shouldAttemptReLogin, options);
  };

  const navItems = [
    { path: RouteNamesEnum.home, label: 'Home', icon: faHome },
    { path: RouteNamesEnum.festival, label: 'Festival', icon: faMusic },
    { path: RouteNamesEnum.tickets, label: 'Buy Tickets', icon: faTicket },
    { path: RouteNamesEnum.resale, label: 'Resale', icon: faExchangeAlt },
    ...(isLoggedIn ? [
      { path: RouteNamesEnum.dashboard, label: 'My Tickets', icon: faWallet },
      { path: RouteNamesEnum.checkin, label: 'Check-In', icon: faQrcode },
    ] : [])
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className='sticky top-0 z-40 backdrop-blur-xl bg-dark-950/80 border-b border-white/5'>
      <div className='max-w-7xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <MxLink
            className='flex items-center gap-3 group'
            to={isLoggedIn ? RouteNamesEnum.dashboard : RouteNamesEnum.home}
          >
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transform group-hover:scale-105 transition-transform'>
              <FontAwesomeIcon icon={faTicket} className='text-white text-lg' />
            </div>
            <span className='text-xl font-bold hidden sm:block'>
              <span className='text-white'>NFT</span>
              <span className='gradient-text'>Tickets</span>
            </span>
          </MxLink>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center gap-1'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all text-sm ${
                  isActivePath(item.path)
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className='text-xs' />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className='flex items-center gap-3'>
            {/* Environment badge */}
            <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10'>
              <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
              <span className='text-xs text-white/60 capitalize'>{environment}</span>
            </div>

            {/* Auth buttons */}
            {isLoggedIn ? (
              <div className='flex items-center gap-2'>
                {/* Wallet address */}
                <div className='hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10'>
                  <FontAwesomeIcon icon={faCheckCircle} className='text-emerald-400 text-sm' />
                  <span className='text-sm font-mono text-white/80'>{formatAddress(address)}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className='p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white'
                  title='Disconnect'
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                </button>
              </div>
            ) : !isUnlockRoute ? (
              <Link to={RouteNamesEnum.unlock} className='btn-primary py-2 px-4 text-sm flex items-center gap-2'>
                <FontAwesomeIcon icon={faWallet} />
                <span className='hidden sm:inline'>Connect Wallet</span>
                <span className='sm:hidden'>Connect</span>
              </Link>
            ) : null}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors'
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className='lg:hidden mt-4 pt-4 border-t border-white/10 animate-slide-down'>
            <div className='flex flex-col gap-2'>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    isActivePath(item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  {item.label}
                </Link>
              ))}
              
              {isLoggedIn && (
                <>
                  <div className='my-2 border-t border-white/10' />
                  <div className='px-4 py-2 text-white/40 text-sm'>
                    Connected: {formatAddress(address)}
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
