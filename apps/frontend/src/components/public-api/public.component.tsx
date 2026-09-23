'use client';

import { useState, useCallback, useMemo } from 'react';
import { Copy, ExternalLink, Eye, EyeOff, RotateCw } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import { useUser } from '../layout/user.context';
import copy from 'copy-to-clipboard';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useDecisionModal } from '@gitroom/frontend/components/layout/new-modal';
import { DeveloperComponent } from '@gitroom/frontend/components/developer/developer.component';
import { McpClientIcon } from '@gitroom/frontend/components/public-api/mcp.client.icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gitroom/react/ui/card';
import { Button } from '@gitroom/react/ui/button';
import { Input } from '@gitroom/react/ui/input';

// Remote clients can't set headers, they get a URL to paste (hint = where)
export const remoteMcpClients = {
  Claude:
    'In Claude go to Settings > Connectors > Add custom connector and paste this URL.',
  ChatGPT:
    'In ChatGPT go to Settings > Connectors > Create and paste this URL.',
} as const;

// Official one-click connectors listed in the assistants' directories.
// Only for the hosted Postiz (billingEnabled), they point at the public MCP server.
export const mcpConnectorUrls = {
  Claude: 'https://claude.ai/directory/postiz',
  ChatGPT:
    'https://chatgpt.com/plugins/plugin_asdk_app_6aaaf1a529808191a2a15fde824bb013',
  Cursor: 'https://cursor.com/marketplace/postiz',
  'Grok Bot': 'https://x.ai/bot/plugin/58737848',
} as const;

// Clients with no MCP or CLI settings: you paste instructions into the chat,
// the agent installs the CLI itself and asks you for the API key
export const chatOnlyMcpClients = {
  'Grok Bot':
    'Install the Postiz CLI with `npm install -g postiz`, then install the Postiz skill with `npx skills add gitroomhq/postiz-agent`. Ask me for my Postiz API key and set it as the POSTIZ_API_KEY environment variable before using the CLI.',
} as const;

export const mcpClients = [
  'OpenClaw',
  'Hermes',
  'NanoClaw',
  'Claude Code',
  'Cursor',
  'Codex',
  'VS Code / Copilot',
  'Windsurf',
  'Amp',
  'Gemini CLI',
  'Warp',
] as const;

export type RemoteMcpClient = keyof typeof remoteMcpClients;
export type ChatOnlyMcpClient = keyof typeof chatOnlyMcpClients;
export type McpClient = (typeof mcpClients)[number];
export type AnyMcpClient = RemoteMcpClient | ChatOnlyMcpClient | McpClient;

// oauth: no API key, the client registers itself (DCR) and the user signs in to Postiz
// apikey: the organization API key, as a Bearer header (or inside the URL for remote clients)
export type McpAuth = 'oauth' | 'apikey';

export const getMcpOauthUrl = (mcpBase: string) =>
  `${mcpBase}/mcp-oauth-dynamic`;

export const isRemoteMcpClient = (client: string): client is RemoteMcpClient =>
  client in remoteMcpClients;

export const isChatOnlyMcpClient = (
  client: string
): client is ChatOnlyMcpClient => client in chatOnlyMcpClients;

export const getMcpConfig = (
  client: AnyMcpClient,
  auth: McpAuth,
  mcpBase: string,
  apiKey: string
): { config: string; hint: string } => {
  if (isChatOnlyMcpClient(client)) {
    return {
      config: chatOnlyMcpClients[client],
      hint: 'Paste this into the chat. The agent will ask you for your API key.',
    };
  }
  if (isRemoteMcpClient(client)) {
    return {
      config:
        auth === 'oauth' ? getMcpOauthUrl(mcpBase) : `${mcpBase}/mcp/${apiKey}`,
      hint: remoteMcpClients[client],
    };
  }

  const oauthUrl = getMcpOauthUrl(mcpBase);
  const urlBase = `${mcpBase}/mcp`;
  const bearer = `Bearer ${apiKey}`;

  const json = (obj: object) => JSON.stringify(obj, null, 2);

  if (auth === 'oauth') {
    switch (client) {
      case 'Claude Code':
        return {
          config: `claude mcp add postiz --transport http "${oauthUrl}"`,
          hint: 'Run this command in your terminal.',
        };
      case 'Cursor':
        return {
          config: json({ mcpServers: { postiz: { url: oauthUrl } } }),
          hint: 'Add to .cursor/mcp.json in your project root.',
        };
      case 'VS Code / Copilot':
        return {
          config: json({
            servers: { postiz: { type: 'http', url: oauthUrl } },
          }),
          hint: 'Add to .vscode/mcp.json in your project root.',
        };
      case 'Windsurf':
        return {
          config: json({
            mcpServers: { postiz: { serverUrl: oauthUrl } },
          }),
          hint: 'Add to ~/.codeium/windsurf/mcp_config.json',
        };
      case 'Amp':
        return {
          config: `amp mcp add postiz ${oauthUrl}`,
          hint: 'Run this command in your terminal.',
        };
      case 'Codex':
        return {
          config: `# ~/.codex/config.toml\n\n[mcp_servers.postiz]\nurl = "${oauthUrl}"`,
          hint: 'Add to ~/.codex/config.toml, then run: codex mcp login postiz',
        };
      case 'Gemini CLI':
        return {
          config: json({ mcpServers: { postiz: { url: oauthUrl } } }),
          hint: 'Add to ~/.gemini/settings.json',
        };
      case 'Warp':
        return {
          config: json({ postiz: { url: oauthUrl } }),
          hint: 'Settings > MCP Servers > + Add, then paste this config.',
        };
      case 'Hermes':
        return {
          config: `# ~/.hermes/config.yaml\n\nmcp_servers:\n  postiz:\n    url: "${oauthUrl}"\n    auth: oauth`,
          hint: 'Add to ~/.hermes/config.yaml, then run /reload-mcp in the chat.',
        };
      case 'OpenClaw':
        return {
          config: `openclaw mcp add postiz --url ${oauthUrl} --transport streamable-http --auth oauth && openclaw mcp login postiz`,
          hint: 'Run this command in your terminal.',
        };
      case 'NanoClaw':
        return {
          config: `ncl groups config add-mcp-server --id <group-id> --name postiz --url ${oauthUrl}`,
          hint: 'Run this in your terminal, replace <group-id> with the agent group that should get Postiz.',
        };
    }
  }

  switch (client) {
    case 'Claude Code':
      return {
        config: `claude mcp add --transport http postiz ${urlBase} --header "Authorization: ${bearer}"`,
        hint: 'Run this command in your terminal.',
      };
    case 'Cursor':
      return {
        config: json({
          mcpServers: {
            postiz: { url: urlBase, headers: { Authorization: bearer } },
          },
        }),
        hint: 'Add to .cursor/mcp.json in your project root.',
      };
    case 'VS Code / Copilot':
      return {
        config: json({
          servers: {
            postiz: {
              type: 'http',
              url: urlBase,
              headers: { Authorization: bearer },
            },
          },
        }),
        hint: 'Add to .vscode/mcp.json in your project root.',
      };
    case 'Windsurf':
      return {
        config: json({
          mcpServers: {
            postiz: {
              serverUrl: urlBase,
              headers: { Authorization: bearer },
            },
          },
        }),
        hint: 'Add to ~/.codeium/windsurf/mcp_config.json',
      };
    case 'Amp':
      return {
        config: json({
          'amp.mcpServers': {
            postiz: { url: urlBase, headers: { Authorization: bearer } },
          },
        }),
        hint: 'Add to your Amp settings.json',
      };
    case 'Codex':
      return {
        config: `# ~/.codex/config.toml\n\n[mcp_servers.postiz]\nurl = "${urlBase}"\nhttp_headers = { "Authorization" = "${bearer}" }`,
        hint: 'Add to ~/.codex/config.toml',
      };
    case 'Gemini CLI':
      return {
        config: json({
          mcpServers: {
            postiz: { url: urlBase, headers: { Authorization: bearer } },
          },
        }),
        hint: 'Add to ~/.gemini/settings.json',
      };
    case 'Warp':
      return {
        config: json({
          postiz: { url: urlBase, headers: { Authorization: bearer } },
        }),
        hint: 'Settings > MCP Servers > + Add, then paste this config.',
      };
    case 'Hermes':
      return {
        config: `# ~/.hermes/config.yaml\n\nmcp_servers:\n  postiz:\n    url: "${urlBase}"\n    headers:\n      Authorization: "${bearer}"`,
        hint: 'Add to ~/.hermes/config.yaml, then run /reload-mcp in the chat.',
      };
    case 'OpenClaw':
      return {
        config: json({
          mcp: {
            servers: {
              postiz: {
                url: urlBase,
                transport: 'streamable-http',
                headers: { Authorization: bearer },
              },
            },
          },
        }),
        hint: 'Add to ~/.openclaw/openclaw.json',
      };
    case 'NanoClaw':
      // No headers flag, the key travels inside the URL like remote clients
      return {
        config: `ncl groups config add-mcp-server --id <group-id> --name postiz --url ${mcpBase}/mcp/${apiKey}`,
        hint: 'Run this in your terminal, replace <group-id> with the agent group that should get Postiz.',
      };
  }
};

export const CopyButton = ({
  text,
  label,
}: {
  text: string;
  label: string;
}) => {
  const toaster = useToaster();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        copy(text);
        toaster.show(`${label} copied to clipboard`, 'success');
      }}
    >
      <Copy />
      {label}
    </Button>
  );
};

const McpSection = ({
  user,
  mcpBase,
}: {
  user: { publicApi: string };
  mcpBase: string;
}) => {
  const t = useT();
  const { billingEnabled } = useVariables();
  const [activeClient, setActiveClient] = useState<AnyMcpClient>('Claude');
  const [auth, setAuth] = useState<McpAuth>('oauth');
  const [revealed, setRevealed] = useState(false);

  const { config, hint } = getMcpConfig(
    activeClient,
    auth,
    mcpBase,
    user.publicApi
  );

  const baseUrl = auth === 'oauth' ? getMcpOauthUrl(mcpBase) : `${mcpBase}/mcp`;

  const chatOnly = isChatOnlyMcpClient(activeClient);

  const maskedConfig =
    revealed || auth === 'oauth' || chatOnly
      ? config
      : config.replace(
          new RegExp(user.publicApi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          '*'.repeat(user.publicApi.length)
        );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-[12px]">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>
              {t('mcp_client_configuration', 'MCP Client Configuration')}
            </CardTitle>
            <CardDescription>
              {t(
                'connect_your_mcp_client_to_postiz_to_schedule_your_posts_faster',
                'Connect Postiz MCP server to your client (Http streaming) to schedule your posts faster.'
              )}
            </CardDescription>
          </div>
          <div className="flex gap-[6px] shrink-0">
            {billingEnabled && (
              <>
                <Button asChild>
                  <a href={mcpConnectorUrls.Claude} target="_blank">
                    <ExternalLink />
                    {t('add_to_claude', 'Add to Claude')}
                  </a>
                </Button>
                <Button asChild>
                  <a href={mcpConnectorUrls.ChatGPT} target="_blank">
                    <ExternalLink />
                    {t('add_to_chatgpt', 'Add to ChatGPT')}
                  </a>
                </Button>
              </>
            )}
            <Button asChild>
              <a
                href="https://docs.postiz.com/mcp/introduction"
                target="_blank"
              >
                <ExternalLink />
                {t('read_the_docs', 'Docs')}
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        {!chatOnly && (
          <div className="flex flex-col gap-[6px]">
            <div className="text-sm font-medium">
              {t('auth_method', 'Authentication')}
            </div>
            <div className="flex gap-[6px]">
              {(['oauth', 'apikey'] as const).map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={auth === m ? 'default' : 'secondary'}
                  onClick={() => setAuth(m)}
                >
                  {m === 'oauth'
                    ? t('sign_in_no_api_key', 'Sign in with Postiz (no API key)')
                    : t('api_key', 'API Key')}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-[6px]">
          <div className="text-sm font-medium">{t('mcp_client', 'Client')}</div>
          <div className="flex flex-wrap gap-[6px]">
            {[
              ...Object.keys(remoteMcpClients),
              ...mcpClients,
              ...Object.keys(chatOnlyMcpClients),
            ].map((client) => (
              <Button
                key={client}
                type="button"
                variant={activeClient === client ? 'default' : 'secondary'}
                onClick={() => setActiveClient(client as AnyMcpClient)}
              >
                <McpClientIcon client={client} />
                {client}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[8px]">
          <div className="text-xs text-muted-foreground">
            {hint}
            {auth === 'oauth' &&
              !chatOnly &&
              ` ${t(
                'oauth_sign_in_hint',
                'Your agent will open a browser window to sign in to Postiz.'
              )}`}
          </div>
          <pre className="bg-muted border border-border rounded-md p-4 text-sm whitespace-pre-wrap break-all overflow-x-auto leading-[1.6]">
            {maskedConfig}
          </pre>
          <div className="flex gap-[8px]">
            {auth === 'apikey' && !chatOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setRevealed(!revealed)}
              >
                {revealed ? <EyeOff /> : <Eye />}
                {revealed ? t('hide', 'Hide') : t('reveal', 'Reveal')}
              </Button>
            )}
            <CopyButton text={config} label={t('copy', 'Copy')} />
            {!isRemoteMcpClient(activeClient) && !chatOnly && (
              <CopyButton text={baseUrl} label={t('copy_url', 'Copy URL')} />
            )}
            {activeClient === 'Claude' && billingEnabled && (
              <Button asChild>
                <a href={mcpConnectorUrls.Claude} target="_blank">
                  <ExternalLink />
                  {t('add_to_claude', 'Add to Claude')}
                </a>
              </Button>
            )}
            {activeClient === 'ChatGPT' && billingEnabled && (
              <Button asChild>
                <a href={mcpConnectorUrls.ChatGPT} target="_blank">
                  <ExternalLink />
                  {t('add_to_chatgpt', 'Add to ChatGPT')}
                </a>
              </Button>
            )}
            {activeClient === 'Grok Bot' && billingEnabled && (
              <Button asChild>
                <a href={mcpConnectorUrls['Grok Bot']} target="_blank">
                  <ExternalLink />
                  {t('add_to_grok_bot', 'Add to Grok Bot')}
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const localCliSteps = [
  {
    label: 'Install the CLI',
    code: 'npm install -g postiz',
  },
  {
    label: 'Run: postiz auth:login',
    code: 'postiz auth:login',
  },
  {
    label: 'Install the Postiz skill for your AI agent',
    code: 'npx skills add gitroomhq/postiz-agent',
  },
] as const;

const ciCliSteps = [
  {
    label: 'Install the CLI',
    code: 'npm install -g postiz',
  },
  {
    label: 'Set your API key as an environment variable',
    code: 'export POSTIZ_API_KEY="{API_KEY}"',
  },
  {
    label: 'Install the Postiz skill for your AI agent',
    code: 'npx skills add gitroomhq/postiz-agent',
  },
] as const;

const CliSection = ({ apiKey }: { apiKey: string }) => {
  const t = useT();
  const [mode, setMode] = useState<'local' | 'ci'>('local');
  const [revealed, setRevealed] = useState(false);

  const steps =
    mode === 'local'
      ? localCliSteps.map((step) => ({ ...step }))
      : ciCliSteps.map((step) => ({
          ...step,
          code: step.code.replace('{API_KEY}', apiKey),
        }));

  const displaySteps =
    mode === 'ci' && !revealed
      ? steps.map((step) => ({
          ...step,
          code: step.code.replace(
            new RegExp(apiKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            '*'.repeat(apiKey.length)
          ),
        }))
      : steps;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-[12px]">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>{t('cli_and_skills', 'CLI & AI Skills')}</CardTitle>
            <CardDescription>
              {t(
                'cli_description',
                'Use the Postiz CLI to automate posting from your terminal, or install the skill to let your AI agent schedule posts for you.'
              )}
            </CardDescription>
          </div>
          <div className="flex gap-[6px] shrink-0">
            <Button asChild>
              <a
                href="https://docs.postiz.com/cli/introduction"
                target="_blank"
              >
                <ExternalLink />
                {t('read_the_docs', 'Docs')}
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-[16px]">
        <div className="flex gap-[6px]">
          {(['local', 'ci'] as const).map((m) => (
            <Button
              key={m}
              type="button"
              variant={mode === m ? 'default' : 'secondary'}
              onClick={() => setMode(m)}
            >
              {m === 'local'
                ? t('locally', 'Locally')
                : t('ci_remote_servers', 'CI / Remote servers')}
            </Button>
          ))}
        </div>
        {displaySteps.map((step, i) => (
          <div key={i} className="flex flex-col gap-[6px]">
            <div className="text-sm font-medium">
              {i + 1}. {step.label}
            </div>
            <pre className="bg-muted border border-border rounded-md p-4 text-sm whitespace-pre-wrap break-all overflow-x-auto leading-[1.6]">
              {step.code}
            </pre>
          </div>
        ))}
        <div className="flex gap-[8px]">
          {mode === 'ci' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <EyeOff /> : <Eye />}
              {revealed ? t('hide', 'Hide') : t('reveal', 'Reveal')}
            </Button>
          )}
          <CopyButton
            text={steps.map((s) => s.code).join(' && ')}
            label={t('copy_all', 'Copy All')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const PublicApiContent = () => {
  const user = useUser();
  const { backendUrl, frontEndUrl, mcpUrl } = useVariables();
  const toaster = useToaster();
  const fetch = useFetch();
  const decision = useDecisionModal();
  const { mutate } = useSWRConfig();
  const [reveal, setReveal] = useState(false);
  const t = useT();

  const rotateKey = useCallback(async () => {
    const approved = await decision.open({
      title: t('rotate_api_key', 'Rotate API Key?'),
      description: t(
        'rotate_api_key_description',
        'This will generate a new API key and invalidate the current one. Any integrations using the old key will stop working.'
      ),
      approveLabel: t('rotate', 'Rotate'),
      cancelLabel: t('cancel', 'Cancel'),
    });
    if (!approved) return;
    await fetch('/user/api-key/rotate', { method: 'POST' });
    await mutate('/user/self');
    setReveal(false);
    toaster.show(
      t('api_key_rotated', 'API Key rotated successfully'),
      'success'
    );
  }, [decision, fetch, mutate, toaster]);

  if (!user || !user.publicApi) {
    return null;
  }

  const mcpBase = mcpUrl || backendUrl;

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="text-sm text-foreground leading-[1.7]">
        {t(
          'api_auth_note_line1',
          'Use your API Key to automate your own account.'
        )}
        <br />
        {t(
          'api_auth_note_line2',
          'If you are building a product that schedules posts on behalf of other Postiz users,'
        )}
        <br />
        {t(
          'api_auth_note_line3',
          'create an OAuth App under the "Apps" tab. Your users will authorize your app via OAuth2,'
        )}
        <br />
        {t(
          'api_auth_note_line4',
          'and you will receive a pos_ prefixed token that works with the API, MCP, and CLI — just like an API Key.'
        )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-[12px]">
            <div className="flex flex-col space-y-1.5">
              <CardTitle>{t('api_key', 'API Key')}</CardTitle>
              <CardDescription>
                {t(
                  'use_postiz_api_to_integrate_with_your_tools',
                  'Use Postiz API to integrate with your tools.'
                )}
              </CardDescription>
            </div>
            <div className="flex gap-[6px] shrink-0">
              <Button asChild>
                <a href="https://docs.postiz.com/public-api" target="_blank">
                  <ExternalLink />
                  {t('read_the_docs', 'Docs')}
                </a>
              </Button>
              <Button asChild>
                <a
                  href="https://www.npmjs.com/package/n8n-nodes-postiz"
                  target="_blank"
                >
                  <ExternalLink />
                  {t('n8n_node', 'N8N Node')}
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-[16px]">
          <Input
            readOnly
            className="font-mono"
            value={
              reveal
                ? user.publicApi
                : `${'•'.repeat(
                    Math.max(user.publicApi.length - 5, 0)
                  )}${user.publicApi.slice(-5)}`
            }
          />
          <div className="flex gap-[8px]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReveal(!reveal)}
            >
              {reveal ? <EyeOff /> : <Eye />}
              {reveal ? t('hide', 'Hide') : t('reveal', 'Reveal')}
            </Button>
            <CopyButton text={user.publicApi} label={t('copy', 'Copy')} />
            <Button type="button" variant="destructive" onClick={rotateKey}>
              <RotateCw />
              {t('rotate_key', 'Rotate Key')}
            </Button>
            <Button
              type="button"
              variant="outline"
              data-tooltip-id="tooltip"
              data-tooltip-content={t(
                'payload_wizard_description',
                'Building a POST request to /posts can be complex. Use the wizard to schedule a post with the UI, then copy the generated payload.'
              )}
              onClick={() =>
                window.open(`${frontEndUrl}/modal/dark/all`, '_blank')
              }
            >
              <ExternalLink />
              {t('open_wizard', 'Open Wizard')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CliSection apiKey={user.publicApi} />

      <McpSection user={user} mcpBase={mcpBase} />
    </div>
  );
};

export const PublicComponent = () => {
  const t = useT();
  const fetch = useFetch();
  const user = useUser();
  const [subTab, setSubTab] = useState<'api' | 'developer'>('api');
  const loadOrganizations = useCallback(async () => {
    return await (await fetch('/user/organizations')).json();
  }, []);
  const { data: organizations } = useSWR('organizations', loadOrganizations, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    revalidateOnReconnect: false,
  });
  const currentOrg = useMemo(() => {
    return organizations?.find((org: any) => org?.id === user?.orgId);
  }, [organizations, user?.orgId]);

  return (
    <div className="flex flex-col gap-[20px]">
      <h3 className="text-[20px]">
        {t('developers', 'Developers')}
        {currentOrg?.name ? ` - ${currentOrg.name}` : ''}
      </h3>
      <div className="flex gap-[6px]">
        {(['api', 'developer'] as const).map((tab) => (
          <Button
            key={tab}
            type="button"
            variant={subTab === tab ? 'default' : 'secondary'}
            onClick={() => setSubTab(tab)}
          >
            {tab === 'api' ? t('access', 'Access') : t('apps', 'Apps')}
          </Button>
        ))}
      </div>
      {subTab === 'api' && <PublicApiContent />}
      {subTab === 'developer' && <DeveloperComponent />}
    </div>
  );
};
