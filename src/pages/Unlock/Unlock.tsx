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
  faArrowRight,
  faMobileScreen,
  faKey,
  faPuzzlePiece,
  faGlobe
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

  // Wallet options with descriptions
  const walletOptions = [
    {
      id: 'xportal',
      name: 'xPortal App',
      description: 'Scan QR code with xPortal mobile app',
      icon: faMobileScreen,
      recommended: true,
      component: (
        <WalletConnectLoginButton
          loginButtonText='xPortal App'
          {...commonProps}
        />
      )
    },
    {
      id: 'defi',
      name: 'DeFi Wallet',
      description: 'Browser extension for MultiversX',
      icon: faPuzzlePiece,
      recommended: false,
      component: (
        <ExtensionLoginButton
          loginButtonText='DeFi Wallet'
          {...commonProps}
        />
      )
    },
    {
      id: 'webwallet',
      name: 'Web Wallet',
      description: 'Login via MultiversX Web Wallet',
      icon: faGlobe,
      recommended: false,
      component: (
        <CrossWindowLoginButton
          loginButtonText='Web Wallet'
          {...commonProps}
        />
      )
    },
    {
      id: 'ledger',
      name: 'Ledger',
      description: 'Connect with hardware wallet',
      icon: faKey,
      recommended: false,
      component: (
        <LedgerLoginButton
          loginButtonText='Ledger'
          {...commonProps}
        />
      )
    }
  ];

  return (
    <AuthRedirectWrapper requireAuth={false}>
      <div className='min-h-[80vh] w-full flex items-center justify-center px-6 py-12'>
        <div className='w-full max-w-lg mx-auto'>
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
            className='glass-card p-6 space-y-3'
            data-testid='unlockPage'
          >
            {walletOptions.map((option) => (
              <div 
                key={option.id}
                className='wallet-login-btn relative'
              >
                {option.recommended && (
                  <span className='absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full z-10'>
                    Recommended
                  </span>
                )}
                <div className='wallet-btn-wrapper'>
                  {option.component}
                </div>
                <div className='wallet-btn-overlay'>
                  <div className='flex items-center gap-4'>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      option.recommended 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-white/10'
                    }`}>
                      <FontAwesomeIcon icon={option.icon} className='text-xl text-white' />
                    </div>
                    <div className='text-left'>
                      <div className='font-semibold text-white'>{option.name}</div>
                      <div className='text-sm text-white/50'>{option.description}</div>
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className='text-white/40' />
                </div>
              </div>
            ))}
          </div>

          {/* Security notice */}
          <div className='mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3'>
            <FontAwesomeIcon icon={faShieldHalved} className='text-emerald-400 mt-0.5' />
            <div>
              <p className='text-emerald-300 text-sm font-medium'>Secure Connection</p>
              <p className='text-emerald-300/70 text-xs mt-1'>
                Your wallet credentials never leave your device. We only request read access to your public address.
              </p>
            </div>
          </div>

          {/* Help text */}
          <div className='mt-6 text-center'>
            <p className='text-white/40 text-sm'>
              New to MultiversX?{' '}
              <a 
                href='https://xportal.com' 
                target='_blank' 
                rel='noopener noreferrer'
                className='text-purple-400 hover:text-purple-300 transition-colors'
              >
                Get xPortal Wallet
                <FontAwesomeIcon icon={faArrowRight} className='ml-1 text-xs' />
              </a>
            </p>
            <p className='text-white/30 text-xs mt-2'>
              Using <span className='text-purple-400'>MultiversX Testnet</span> for this demo
            </p>
          </div>
        </div>
      </div>
    </AuthRedirectWrapper>
  );
};
