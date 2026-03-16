const fs = require('fs');
const dotenv = require('dotenv');
const parsed = dotenv.parse(fs.readFileSync('./.env'));
fetch(parsed.SUPABASE_URL + '/rest/v1/', { headers: { 'apikey': parsed.SUPABASE_SERVICE_ROLE_KEY, 'Authorization': 'Bearer ' + parsed.SUPABASE_SERVICE_ROLE_KEY } })
  .then(res => res.json())
  .then(data => {
      Object.keys(data.definitions).forEach(table => {
          if (['resources', 'volunteers', 'events', 'disasters'].includes(table)) {
              console.log(table, '->', Object.keys(data.definitions[table].properties).join(', '));
          }
      });
  })
  .catch(console.error);
