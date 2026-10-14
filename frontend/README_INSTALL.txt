JADEER - ALL GOLDEN SQUARE PLOT MAP THUMBNAILS

WHAT CHANGED
- Added individual map thumbnails under public/maps/plots/plot-{number}.webp.
- AgentDashboard now selects the map image based on the submitted property's رقم القطعة / piece number.
- The image appears after the property submission is approved and the listing appears in العقارات.
- Existing apartment cards, filters, owner request flow, submission forms, tasks, Admin dashboard, and theme styles are preserved.
- Thumbnails are 480x288 WebP files.

INSTALL
1. Make a Git checkpoint before replacing files.
2. Extract this ZIP into the React/Vite project root (the folder containing src and public).
3. Allow the five included files in src/ to replace the matching project files.
4. Merge public/maps/ into your existing public/maps/ folder; do not delete existing assets. This package includes legacy thumbnails, golden-square-map.png, the plots/ folder, and plot-map-index.json.
5. Do not replace App.css, index.css, or package.json.
6. Refresh the app and test a newly submitted apartment or land property: enter a plot number that appears on the map, submit it, approve it in the Admin dashboard, then open Agent > العقارات.

MAP SOURCE NOTE
The supplied PDF has 1,538 unique plot-number labels across the expected 1-1539 range. Number 295 appears twice, and number 299 is not present as a label. The first 295 (adjacent to 294 and 296) is used for plot-295.webp; the second crop is preserved as plot-295-duplicate-2.webp for review. No plot-299.webp is generated so the app does not falsely show another parcel as 299; it displays a map warning for that number. See PLOT_MAP_AUDIT.txt.

IMPORTANT
- Beit Watan uses a separate map and will keep its placeholder until its own map source is provided.
- This remains a frontend prototype using React state; it does not add database persistence.
