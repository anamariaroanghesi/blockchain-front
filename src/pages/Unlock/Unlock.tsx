import { CrossWindowLoginButton } from 'components/sdkDappComponents';
import { nativeAuth } from 'config';
import { RouteNamesEnum } from 'localConstants';
import { AuthRedirectWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, 
  faShieldHalved, 
  faArrowRight,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';

export const Unlock = () => {
  const commonProps = {
    callbackRoute: RouteNamesEnum.dashboard,
    nativeAuth
  };

  return (
    <AuthRedirectWrapper requireAuth={false}>
      <div className='min-h-[80vh] w-full flex items-center justify-center px-6 py-12'>
        <div className='w-full max-w-md mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30'>
              <FontAwesomeIcon icon={faWallet} className='text-4xl text-white' />
            </div>
            <h1 className='text-3xl font-bold mb-2'>Connect Wallet</h1>
            <p className='text-white/60'>
              Connect to NFT Ticket Master using MultiversX Web Wallet
            </p>
          </div>

          {/* Login Option */}
          <div 
            className='glass-card p-8'
            data-testid='unlockPage'
          >
            <div className='text-center mb-6'>
              <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4'>
                <FontAwesomeIcon icon={faGlobe} className='text-2xl text-white' />
              </div>
              <h2 className='text-xl font-semibold mb-2'>MultiversX Web Wallet</h2>
              <p className='text-white/50 text-sm'>
                Securely connect using the official MultiversX web wallet
              </p>
            </div>
            
            <CrossWindowLoginButton
              loginButtonText='Connect with Web Wallet'
              {...commonProps}
            />
          </div>

          {/* Security notice */}
          <div className='mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3'>
            <FontAwesomeIcon icon={faShieldHalved} className='text-emerald-400 mt-0.5' />
            <div>
              <p className='text-emerald-300 text-sm font-medium'>Secure Connection</p>
              <p className='text-emerald-300/70 text-xs mt-1'>
                Your private keys never leave your wallet. We only request permission to view your public address.
              </p>
            </div>
          </div>

          {/* Help text */}
          <div className='mt-6 text-center'>
            <p className='text-white/40 text-sm'>
              Don't have a wallet?{' '}
              <a 
                href='https://wallet.multiversx.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='text-purple-400 hover:text-purple-300 transition-colors'
              >
                Create one here
                <FontAwesomeIcon icon={faArrowRight} className='ml-1 text-xs' />
              </a>
            </p>
            <p className='text-white/30 text-xs mt-2'>
              This app uses <span className='text-purple-400'>MultiversX Devnet</span>
            </p>
          </div>
        </div>
      </div>
    </AuthRedirectWrapper>
  );
};
