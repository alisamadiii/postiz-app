'use client';

import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Web3ProviderInterface } from '@gitroom/frontend/components/launches/web3/web3.provider.interface';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { timer } from '@gitroom/helpers/utils/timer';
import { Input } from '@gitroom/react/ui/input';
import { Button } from '@gitroom/react/ui/button';
import copy from 'copy-to-clipboard';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const MoltbookProvider: FC<Web3ProviderInterface> = (props) => {
  const { onComplete, nonce } = props;
  const fetch = useFetch();
  const stop = useRef(false);
  const [step, setStep] = useState<'init' | 'registering' | 'waiting' | 'error'>('init');
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [claimUrl, setClaimUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const toaster = useToaster();
  const t = useT();

  const register = async () => {
    if (!agentName.trim()) {
      toaster.show('Please enter an agent name', 'warning');
      return;
    }

    setStep('registering');
    setError('');

    try {
      const response = await fetch('/integrations/moltbook/register', {
        method: 'POST',
        body: JSON.stringify({
          name: agentName.trim(),
          description: agentDescription.trim() || 'Postiz social media scheduler',
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setStep('error');
        return;
      }

      setApiKey(data.apiKey);
      setClaimUrl(data.claimUrl);
      setStep('waiting');

      pollForClaim(data.apiKey);
    } catch (err) {
      setError('Failed to register agent');
      setStep('error');
    }
  };

  const pollForClaim = async (key: string) => {
    stop.current = false;

    while (!stop.current) {
      try {
        const response = await fetch(`/integrations/moltbook/status?apiKey=${encodeURIComponent(key)}`);
        const data = await response.json();

        if (data.claimed) {
          onComplete(key, nonce);
          return;
        }
      } catch (err) {
        // Continue polling
      }

      await timer(3000);
    }
  };

  const copyClaimUrl = useCallback(() => {
    copy(claimUrl);
    toaster.show('Claim URL copied to clipboard', 'success');
  }, [claimUrl, toaster]);

  useEffect(() => {
    return () => {
      stop.current = true;
    };
  }, []);

  return (
    <div className="justify-center items-center flex flex-col pt-[16px]">
      {step === 'init' && (
        <>
          <div className="text-center mb-[16px]">
            {t('moltbook_register_description', 'Register your Moltbook agent to connect:')}
          </div>
          <div className="w-full space-y-[12px]">
            <div className="flex flex-col gap-[6px]">
              <div className="text-[14px] text-foreground">
                {t('agent_name', 'Agent Name')}
              </div>
              <Input
                className="h-[42px]"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="MyPostizAgent"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <div className="text-[14px] text-foreground">
                {t('description_optional', 'Description (optional)')}
              </div>
              <Input
                className="h-[42px]"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Social media scheduler"
              />
            </div>
            <Button type="button" size="lg" className="w-full" onClick={register}>
              {t('register_agent', 'Register Agent')}
            </Button>
          </div>
        </>
      )}

      {step === 'registering' && (
        <div className="text-center">
          {t('registering_agent', 'Registering agent...')}
        </div>
      )}

      {step === 'waiting' && (
        <div className="w-full text-center">
          <div className="mb-[16px]">
            {t('moltbook_claim_instructions', 'Please visit the claim URL to verify your agent:')}
          </div>
          <div className="flex gap-[8px]">
            <div className="flex-1">
              <Input className="h-[42px]" value={claimUrl} readOnly />
            </div>
            <Button type="button" size="lg" onClick={copyClaimUrl}>
              {t('copy', 'Copy')}
            </Button>
          </div>
          <div className="mt-[16px] text-sm opacity-70">
            {t('waiting_for_claim', 'Waiting for you to claim your agent...')}
          </div>
          <div className="mt-[8px]">
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {t('open_claim_page', 'Open claim page')}
            </a>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="w-full text-center">
          <div className="text-red-500 mb-[16px]">{error}</div>
          <Button type="button" size="lg" onClick={() => setStep('init')}>
            {t('try_again', 'Try Again')}
          </Button>
        </div>
      )}
    </div>
  );
};
