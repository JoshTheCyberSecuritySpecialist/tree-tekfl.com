-- Move stored business defaults from the old Volusia service area
-- to Lake Mary / Seminole County. Only replaces the previous defaults.

UPDATE public.settings
SET
  value = jsonb_set(value, '{city}', '"Lake Mary"'),
  updated_at = now()
WHERE key = 'business_info'
  AND value->>'city' = 'Daytona Beach';

UPDATE public.settings
SET
  value = jsonb_set(value, '{service_area}', '"Seminole County, FL"'),
  updated_at = now()
WHERE key = 'business_info'
  AND value->>'service_area' = 'Volusia County, FL';
