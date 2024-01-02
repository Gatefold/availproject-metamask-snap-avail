import { useEffect } from 'react';
import './App.css';
import GlobalStyle from 'theme/GlobalStyles';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Home } from 'components/pages/Home';
import { FrameworkView } from 'components/ui/Framework/Framework.view';
import { useAppSelector } from 'hooks/redux';
import { ThemeProvider } from 'styled-components';
import { theme } from 'theme/default';
import { ConnectModal } from 'components/ui/organism/ConnectModal';
import { PopIn } from 'components/ui/molecule/PopIn';
import { LoadingBackdrop } from 'components/ui/molecule/LoadingBackdrop';
import { ConnectInfoModal } from 'components/ui/organism/ConnectInfoModal';
import 'toastr2/dist/toastr.min.css';
import { NoMetamaskModal } from 'components/ui/organism/NoMetamaskModal';
import { useHasMetamask } from 'hooks/useHasMetamask';
import { useAvailSnap } from 'services/metamask';
import { MinVersionModal } from './components/ui/organism/MinVersionModal';

library.add(fas, far);

function App(): React.JSX.Element {
  const { initSnap, getWalletData, checkConnection } = useAvailSnap();
  const { accounts, connected, forceReconnect, provider } = useAppSelector((state) => state.wallet);
  const { infoModalVisible, minVersionModalVisible } = useAppSelector((state) => state.modals);
  const { loader } = useAppSelector((state) => state.UI);
  const networks = useAppSelector((state) => state.networks);
  const { hasMetamask } = useHasMetamask();

  const address =
    accounts?.length > 0 ? (accounts[0] as unknown as string) : '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  useEffect(() => {
    if (!provider) {
      return;
    }
    if (connected) {
      console.log('Are we here??');
      initSnap();
    }
    if (hasMetamask && !connected && !forceReconnect) {
      checkConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, forceReconnect, hasMetamask, provider]);

  useEffect(() => {
    if (provider && networks.items.length > 0) {
      const chainId = networks.items[networks.activeNetwork].chainId;
      getWalletData(chainId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networks.activeNetwork, provider]);

  const loading = loader.isLoading;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <FrameworkView connected={connected}>
        <PopIn isOpen={!connected && !loading} showClose={false}>
          <NoMetamaskModal />
        </PopIn>
        <PopIn isOpen={minVersionModalVisible} showClose={false}>
          <MinVersionModal />
        </PopIn>
        <PopIn isOpen={!loading && !!hasMetamask && !connected} showClose={false}>
          <ConnectModal />
        </PopIn>
        <PopIn isOpen={infoModalVisible} showClose={false}>
          <ConnectInfoModal address={address} />
        </PopIn>
        <Home address={address} />
        <PopIn isOpen={loading}>
          {loading && <LoadingBackdrop>{loader.loadingMessage}</LoadingBackdrop>}
        </PopIn>
      </FrameworkView>
    </ThemeProvider>
  );
}

export default App;
