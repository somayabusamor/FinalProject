import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { Platform } from 'react-native';
import React from 'react';

// Use the exact type for 'href' from expo-router
type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: React.ComponentProps<typeof Link>['href'];
};

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href as string); // Type assertion for `openBrowserAsync`
        }
      }}
    />
  );
}
