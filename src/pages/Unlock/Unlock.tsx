import {
  type ExtensionLoginButtonPropsType,
  type WebWalletLoginButtonPropsType,
  type LedgerLoginButtonPropsType,
  type WalletConnectLoginButtonPropsType
} from '@multiversx/sdk-dapp/UI';
import {
  ExtensionLoginButton,
  LedgerLoginButton,
  WalletConnectLoginButton,
  CrossWindowLoginButton
} from 'components/sdkDappComponents';
import { nativeAuth } from 'config';
import { RouteNamesEnum } from 'localConstants';
import { useNavigate } from 'react-router-dom';
import { AuthRedirectWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, 
  faShieldHalved, 
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

type CommonPropsType =
  | ExtensionLoginButtonPropsType
  | WebWalletLoginButtonPropsType
  | LedgerLoginButtonPropsType
  | WalletConnectLoginButtonPropsType;

export const Unlock = () => {
  const navigate = useNavigate();

  const commonProps: CommonPropsType = {
    callbackRoute: RouteNamesEnum.dashboard,
    nativeAuth,
    onLoginRedirect: () => {
      navigate(RouteNamesEnum.dashboard);
    }
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
              Choose a wallet to connect to NFT Ticket Master
            </p>
          </div>

          {/* Login Options */}
          <div 
            className='glass-card p-6'
            data-testid='unlockPage'
          >
            {/* Recommended - xPortal */}
            <div className='mb-4'>
              <div className='text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2'>
                📱 Recommended
              </div>
              <WalletConnectLoginButton
                loginButtonText='xPortal App'
                {...commonProps}
              />
              <p className='text-xs text-white/40 mt-1 ml-1'>
                Scan QR code with xPortal mobile app
              </p>
            </div>

            <div className='border-t border-white/10 my-4' />

            {/* Other Options */}
            <div className='text-xs text-white/50 font-semibold uppercase tracking-wider mb-3'>
              Other Options
            </div>
            
            <div className='space-y-2'>
              <ExtensionLoginButton
                loginButtonText='🧩 DeFi Wallet Extension'
                {...commonProps}
              />
              
              <CrossWindowLoginButton
                loginButtonText='🌐 MultiversX Web Wallet'
                {...commonProps}
              />
              
              <LedgerLoginButton
                loginButtonText='🔐 Ledger Hardware Wallet'
                {...commonProps}
              />
            </div>
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
                href='https://xportal.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='text-purple-400 hover:text-purple-300 transition-colors'
              >
                Download xPortal
                <FontAwesomeIcon icon={faArrowRight} className='ml-1 text-xs' />
              </a>
            </p>
            <p className='text-white/30 text-xs mt-2'>
              This app uses <span className='text-purple-400'>MultiversX Testnet</span>
            </p>
          </div>
        </div>
      </div>
    </AuthRedirectWrapper>
  );
};
