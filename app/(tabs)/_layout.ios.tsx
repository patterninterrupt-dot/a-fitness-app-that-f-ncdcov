
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Workout</Label>
        <Icon sf="figure.strengthtraining.traditional" drawable="fitness-center" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Library</Label>
        <Icon sf="book.fill" drawable="menu-book" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
