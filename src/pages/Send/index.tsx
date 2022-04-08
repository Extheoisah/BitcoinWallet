import { useState } from "react";
import { Psbt } from "bitcoinjs-lib";

import { broadcastTx } from "src/utils/blockstream-api";

import CreateTxForm from "./components/CreateTxForm";
import TransactionSummary from "./components/TransactionSummary";

import { Address, DecoratedUtxo } from "src/types";

import { createTransasction, signTransaction } from "../../utils/bitcoinjs-lib";

interface Props {
  utxos: DecoratedUtxo[];
  changeAddresses: Address[];
  mnemonic: string;
  watchMode: boolean;
}

export default function Send({
  utxos,
  changeAddresses,
  mnemonic,
  watchMode,
}: Props) {
  const [step, setStep] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [transaction, setTransaction] = useState<Psbt | undefined>(undefined); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const createTransactionWithFormValues = async (
    recipientAddress: string,
    amountToSend: number
  ) => {
    try {
      const psbt = await createTransasction(
        utxos,
        recipientAddress,
        amountToSend,
        changeAddresses[0]
      );
      setTransaction(psbt);
      setTransaction(await signTransaction(psbt, mnemonic));
      console.log(psbt);

      setStep(1);
    } catch (e: any) {
      // const errMsg = e?.response
      console.log(e);
      setError((e as Error).message);
    }
  };

  return (
    <div>
      <main className="flex-1">
        <div className="py-6">
          {watchMode ? (
            <div className="flex justify-center items-center mt-40">
              <p className="text-tabconf-blue-500 text-center text-2xl font-bold ">
                You can not make transactions in watch mode!
              </p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {step === 0 && (
                <CreateTxForm
                  error={error}
                  createTransaction={createTransactionWithFormValues}
                />
              )}
              {step === 1 && (
                <TransactionSummary
                  transaction={transaction!}
                  utxos={utxos}
                  broadcastTx={broadcastTx}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
