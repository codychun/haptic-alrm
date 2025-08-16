
// SimpleTimePickerButton.tsx
import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SimpleTimePickerButtonProps {
  time: string;
  onTimeChange?: (newTime: string) => void;
  style?: any;
}

export function SimpleTimePickerButton({
  time,
  onTimeChange,
  style,
}: SimpleTimePickerButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    // On Android, always hide picker after selection
    /*
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    */
    
    if (selectedDate && onTimeChange) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      onTimeChange(newTime);
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'web') {
      // For web, create a simple input
      const newTime = prompt('Enter time (HH:MM)', time);
      if (newTime && /^\d{2}:\d{2}$/.test(newTime)) {
        onTimeChange?.(newTime);
      }
    } else {
      setShowPicker(true);
    }
  };

  // Create initial date from time string
  const createDateFromTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);
    return date;
  };

  return (
    <View>
      <TouchableOpacity 
        onPress={handlePress} 
        accessible={true}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            minHeight: 50,
          },
          style
        ]}
      >
        <Text style={{ fontSize: 18, fontWeight: '500' }}>{time}</Text>
        <Text style={{ fontSize: 16, color: '#666' }}>▶</Text>
      </TouchableOpacity>
      
      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={createDateFromTime(time)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          onChange={handleTimeChange}
          onTouchCancel={() => setShowPicker(false)}
        />
      )}
    </View>
  );
}