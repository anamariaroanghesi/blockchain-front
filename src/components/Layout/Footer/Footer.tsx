import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTicket } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import { RouteNamesEnum } from 'localConstants';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className='border-t border-white/5 bg-dark-950/50'>
      <div className='max-w-7xl mx-auto px-6 py-12'>
        <div className='grid md:grid-cols-4 gap-8 mb-8'>
          {/* Brand */}
          <div className='md:col-span-2'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center'>
                <FontAwesomeIcon icon={faTicket} className='text-white text-lg' />
              </div>
              <span className='text-xl font-bold'>
                <span className='text-white'>NFT</span>
                <span className='gradient-text'>Tickets</span>
              </span>
            </div>
            <p className='text-white/50 text-sm max-w-md mb-4'>
              The future of event ticketing. Secure, transparent, and fraud-proof 
              NFT tickets powered by MultiversX blockchain technology.
            </p>
            <div className='flex gap-3'>
              <a 
                href='https://github.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white'
              >
                <FontAwesomeIcon icon={faGithub} />
              </a>
              <a 
                href='https://twitter.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white'
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a 
                href='https://discord.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white'
              >
                <FontAwesomeIcon icon={faDiscord} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2'>
              <li>
                <Link to={RouteNamesEnum.home} className='text-white/50 hover:text-white transition-colors text-sm'>
                  Home
                </Link>
              </li>
              <li>
                <Link to={RouteNamesEnum.tickets} className='text-white/50 hover:text-white transition-colors text-sm'>
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to={RouteNamesEnum.dashboard} className='text-white/50 hover:text-white transition-colors text-sm'>
                  My Tickets
                </Link>
              </li>
              <li>
                <Link to={RouteNamesEnum.validate} className='text-white/50 hover:text-white transition-colors text-sm'>
                  Validate Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className='font-semibold mb-4'>Resources</h4>
            <ul className='space-y-2'>
              <li>
                <a 
                  href='https://docs.multiversx.com' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-white/50 hover:text-white transition-colors text-sm'
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href='https://testnet-explorer.multiversx.com' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-white/50 hover:text-white transition-colors text-sm'
                >
                  Block Explorer
                </a>
              </li>
              <li>
                <Link to={RouteNamesEnum.disclaimer} className='text-white/50 hover:text-white transition-colors text-sm'>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-white/40 text-sm text-center sm:text-left'>
            © {currentYear} NFT Ticket Master. Built on MultiversX.
          </p>
          <p className='text-white/40 text-sm flex items-center gap-2'>
            Made with <FontAwesomeIcon icon={faHeart} className='text-pink-500' /> for Blockchain Course
          </p>
        </div>
      </div>
    </footer>
  );
};
