/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Pre-included "nativewind/preset" is assumed if using nativewind v4, 
  // but standard config works for v2/v4 transitional states often. 
  // For v4 we often use presets: [require("nativewind/preset")].
  // Checking package.json, we have nativewind^4.2.1. 
  // NativeWind v4 usually requires the preset. I'll add it to be safe, 
  // but if it wasn't there before I should be careful. 
  // The previous file didn't have it. I'll stick to standard extension 
  // but I'll add the preset if I'm confident. 
  // Actually, let's stick to the previous structure but expanded, 
  // as adding the preset might break if babel isn't set up for it (though it likely is).
  // NativeWind v4 requires: presets: [require("nativewind/preset")]. 
  // I will add it.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F7A5C', // Ceylon Green
          light: '#2A9B74',
          dark: '#165B45',
        },
        destructive: '#FF3B30',
        background: {
          light: '#FFFFFF',
          dark: '#000000',
          secondary: '#F2F2F7',
          'secondary-dark': '#1C1C1E',
        },
        text: {
          primary: '#000000',
          'primary-dark': '#FFFFFF',
          secondary: '#6E6E73',
          'secondary-dark': '#A1A1A6',
        }
      },
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'image': '16px',
        'sheet': '24px',
      },
      boxShadow: {
        'small': '0 2px 4px rgba(0,0,0,0.08)',
        'medium': '0 4px 8px rgba(0,0,0,0.08)',
        'large': '0 8px 16px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
