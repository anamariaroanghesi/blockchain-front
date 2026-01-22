import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export const Footer = () => {
  return (
    <footer className='border-t border-white/5 bg-dark-950/50 py-10 px-6'>
      <div className='max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-white/40 text-sm'>
        <span>NFT Ticket Master • Built on MultiversX Devnet</span>
        <span className='flex items-center gap-2'>
          Made with <FontAwesomeIcon icon={faHeart} className='text-pink-500' /> for Blockchain Course
        </span>
      </div>
    </footer>
  );
};
