'use client';

import { FC, useCallback, useEffect } from 'react';
import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { GmbSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/gmb.settings.dto';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';
import { Input } from '@gitroom/react/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gitroom/react/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@gitroom/react/ui/form';
import { useWatch } from 'react-hook-form';

const topicTypes = [
  {
    label: 'Standard Update',
    value: 'STANDARD',
  },
  {
    label: 'Event',
    value: 'EVENT',
  },
  {
    label: 'Offer',
    value: 'OFFER',
  },
];

const callToActionTypes = [
  {
    label: 'None',
    value: 'NONE',
  },
  {
    label: 'Book',
    value: 'BOOK',
  },
  {
    label: 'Order Online',
    value: 'ORDER',
  },
  {
    label: 'Shop',
    value: 'SHOP',
  },
  {
    label: 'Learn More',
    value: 'LEARN_MORE',
  },
  {
    label: 'Sign Up',
    value: 'SIGN_UP',
  },
  {
    label: 'Get Offer',
    value: 'GET_OFFER',
  },
  {
    label: 'Call',
    value: 'CALL',
  },
];

const GmbSettings: FC = () => {
  const { control } = useSettings();
  const topicType = useWatch({ control, name: 'topicType' });
  const callToActionType = useWatch({ control, name: 'callToActionType' });

  return (
    <div className="flex flex-col gap-[10px]">
      <FormField
        control={control}
        name="topicType"
        defaultValue="STANDARD"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Post Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-[42px]">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {topicTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="callToActionType"
        defaultValue="NONE"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call to Action</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-[42px]">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {callToActionTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {callToActionType &&
        callToActionType !== 'NONE' &&
        callToActionType !== 'CALL' && (
          <FormField
            control={control}
            name="callToActionUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call to Action URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

      {topicType === 'EVENT' && (
        <div className="flex flex-col gap-[10px] mt-[10px] p-[15px] border border-input rounded-[8px]">
          <div className="text-[14px] font-medium mb-[5px]">Event Details</div>
          <FormField
            control={control}
            name="eventTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Event name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-[10px]">
            <FormField
              control={control}
              name="eventStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="eventEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            <FormField
              control={control}
              name="eventStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="eventEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {topicType === 'OFFER' && (
        <div className="flex flex-col gap-[10px] mt-[10px] p-[15px] border border-input rounded-[8px]">
          <div className="text-[14px] font-medium mb-[5px]">Offer Details</div>
          <FormField
            control={control}
            name="offerCouponCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SAVE20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="offerRedeemUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Redeem Online URL (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://example.com/redeem" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="offerTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms & Conditions (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Valid until..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default withProvider({
  postComment: PostComment.POST,
  minimumCharacters: [],
  SettingsComponent: GmbSettings,
  CustomPreviewComponent: undefined,
  dto: GmbSettingsDto,
  maximumCharacters: 1500,
});
