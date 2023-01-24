import { AptosClient, Types } from 'aptos';
import React from 'react';
import './App.css';

const client = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');

function App() {
  // Retrieve aptos.account on initial render and store it.
  const [address, setAddress] = React.useState<string | null>(null);

  const [account, setAccount] = React.useState<Types.AccountData | null>(null);
  React.useEffect(() => {
    if (!address) return;
    client.getAccount(address).then(setAccount);
  }, [address]);

  console.log('debug', address);

  const [modules, setModules] = React.useState<Types.MoveModuleBytecode[]>([]);
  React.useEffect(() => {
    if (!address) return;
    client.getAccountModules(address).then(setModules);
  }, [address]);

  const ref = React.createRef<HTMLTextAreaElement>();
  const [isSaving, setIsSaving] = React.useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!ref.current) return;

    const message = ref.current.value;
    const transaction = {
      type: 'entry_function_payload',
      function: `${address}::message::set_message`,
      arguments: [message],
      type_arguments: []
    };

    try {
      setIsSaving(true);
      await window.aptos.signAndSubmitTransaction(transaction);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * init function
   */
  const init = async () => {
    // connect
    const { address, publicKey } = await window.aptos.connect();
    setAddress(address);
  };
  // other people
  const urlAddress = window.location.pathname.slice(1);
  const isEditable = !urlAddress;
  React.useEffect(() => {
    if (urlAddress) {
      setAddress(urlAddress);
    } else {
      window.aptos
        .account()
        .then((data: { address: string }) => setAddress(data.address));
    }
  }, [urlAddress]);

  const [resources, setResources] = React.useState<Types.MoveResource[]>([]);
  React.useEffect(() => {
    if (!address) return;
    client.getAccountResources(address).then(setResources);
  }, [address]);
  const resourceType = `${address}::message::MessageHolder`;
  const resource = resources.find((r) => r.type === resourceType);
  const data = resource?.data as { message: string } | undefined;
  const message = data?.message;

  React.useEffect(() => {
    init();
  }, []);

  return (
    <div className='container mx-auto px-6'>
      <div className='mt-20 text-center'>
        <p>
          Account Address: <code>{address}</code>
        </p>
        <p className='text-green-500'>
          Sequence Number: <code>{account?.sequence_number}</code>
        </p>
      </div>
      <p>On-chain message</p>

      <form onSubmit={handleSubmit}>
        <textarea
          className='w-1/2 bg-slate-300 caret-blue-500 focus:caret-indigo-500'
          defaultValue={message}
          ref={ref}
        />
        <textarea
          className='w-1/2 mt-3 bg-slate-300 caret-blue-500 focus:caret-indigo-500'
          ref={ref}
          defaultValue={message}
          readOnly={!isEditable}
        />
        {isEditable && (
          <button
            disabled={isSaving}
            type='button'
            className='border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline'>
            Primary
          </button>
        )}
        {isEditable && (
          <a href={address!}>
            <p className='font-medium border-l-pink-100 mt-5 mb-20'>
              Get public URL
            </p>
          </a>
        )}
      </form>
    </div>
  );
}

export default App;
