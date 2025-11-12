# Airtable → jobs.json Mapping Guide

## Field Mapping Reference

| Airtable Field | JSON Field | Type | Transform | Notes |
|----------------|------------|------|-----------|-------|
| `ID` | `id` | string | Direct | UUID v4 |
| `Job_Title` | `jobTitle` | string | Direct | - |
| `Company_Name` | `companyName` | string | Direct | - |
| `Company_Logo_URL` | `companyLogo` | string | See below | Handle local vs URL |
| `Category` | `category` | string | Map | See category mapping |
| `Tags` | `tags` | array | Direct | Multi-select → array |
| `Description_Short_PT` | `shortDescription` | string | Direct | Optional, max 300 chars |
| `Description_Short_EN` | - | string | Skip for now | Future: bilingual support |
| `Apply_Link` | `applyLink` | string | Direct | Must be valid URL |
| `Date_Posted_Original` | `postedDate` | string | Parse → ISO | Must be ISO 8601 |
| `Location_Scope` | `location.scope` | string | Map | See location mapping |
| `Location_Detail` | `location.note` | string | Direct | Optional, max 160 chars |
| `Contrato` | `contractType` | string | Direct | Optional |
| `Salario_Min` | `salary.min` | number | Direct | Optional |
| `Salario_Max` | `salary.max` | number | Direct | Optional |
| `Moeda` | `salary.currency` | string | Upper | Optional, 3-letter ISO |
| `Status` | - | string | Filter | Only export "Ativa" |

## Category Mapping

```javascript
const categoryMap = {
  'VFX': 'VFX',
  'Arte 3D': '3D & Animation',
  '3D': '3D & Animation',
  'UX/UI': 'Design (UI/UX)',
  'Design': 'Design (UI/UX)',
  'Game Dev': 'Game Dev',
  'Programação': 'Game Dev',
};
```

## Location Scope Mapping

```javascript
const locationScopeMap = {
  'Remoto (Global)': 'remote-worldwide',
  'Remoto (Brasil)': 'remote-brazil',
  'Remoto (LATAM)': 'remote-latam',
  'Híbrido': 'hybrid',
  'Presencial': 'onsite',
};
```

## Company Logo Handling

```javascript
function getCompanyLogo(record) {
  const url = record.get('Company_Logo_URL');
  
  // If empty, use placeholder
  if (!url) return '/images/company-placeholder.svg';
  
  // If starts with http, keep URL
  if (url.startsWith('http')) return url;
  
  // Otherwise treat as local path
  return url.startsWith('/') ? url : `/images/${url}`;
}
```

## Date Handling

```javascript
function parsePostedDate(airtableDate) {
  // If already ISO 8601, return as-is
  if (/^\d{4}-\d{2}-\d{2}T/.test(airtableDate)) {
    return airtableDate;
  }
  
  // Parse and convert to ISO
  const date = new Date(airtableDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${airtableDate}`);
  }
  
  return date.toISOString();
}
```

## Salary Object Construction

```javascript
function buildSalary(record) {
  const min = record.get('Salario_Min');
  const max = record.get('Salario_Max');
  const currency = record.get('Moeda');
  
  // Skip if no currency
  if (!currency) return undefined;
  
  // Skip if both min and max are empty
  if (!min && !max) return undefined;
  
  return {
    min: min || undefined,
    max: max || undefined,
    currency: currency.toUpperCase(),
  };
}
```

## Example Sync Script Structure

```javascript
import Airtable from 'airtable';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

async function syncJobs() {
  const jobs = [];
  
  const records = await base('Jobs')
    .select({
      view: 'Published Jobs',
      filterByFormula: '{Status} = "Ativa"',
    })
    .all();
  
  for (const record of records) {
    const job = {
      id: record.get('ID'),
      companyName: record.get('Company_Name'),
      companyLogo: getCompanyLogo(record),
      jobTitle: record.get('Job_Title'),
      description: record.get('Description_Short_PT') || 'Descrição não disponível.',
      shortDescription: record.get('Description_Short_PT') || undefined,
      applyLink: record.get('Apply_Link'),
      postedDate: parsePostedDate(record.get('Date_Posted_Original')),
      category: categoryMap[record.get('Category')] || record.get('Category'),
      tags: record.get('Tags') || [],
      location: {
        scope: locationScopeMap[record.get('Location_Scope')] || 'remote-brazil',
        note: record.get('Location_Detail') || undefined,
      },
      contractType: record.get('Contrato') || undefined,
      salary: buildSalary(record),
    };
    
    jobs.push(job);
  }
  
  // Write to jobs.json
  const outputPath = resolve(process.cwd(), 'src/data/jobs.json');
  writeFileSync(outputPath, JSON.stringify(jobs, null, 2), 'utf-8');
  
  console.log(`✅ Synced ${jobs.length} jobs to ${outputPath}`);
}

syncJobs().catch(console.error);
```

## Environment Variables

Create `.env` file:

```env
AIRTABLE_API_KEY=your_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

## Validation

After sync, always run:

```bash
npm run validate:jobs
```

This will catch any issues before build.

## Notes

1. **Mandatory fields:** ID, Company_Name, Job_Title, Apply_Link, Date_Posted_Original, Category, Tags (min 1), Location_Scope
2. **Optional fields:** All salary/contract fields, shortDescription, Location_Detail
3. **Status filtering:** Only records with `Status = "Ativa"` are exported
4. **Category normalization:** Always map to one of the 6 allowed categories
5. **Date format:** Must result in valid ISO 8601 with timezone
6. **Logo fallback:** Use placeholder if URL missing or invalid

