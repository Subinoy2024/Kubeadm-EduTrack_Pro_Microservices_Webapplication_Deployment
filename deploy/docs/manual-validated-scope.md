# Manual validated scope

The current MVP validation scope is backend-only:
- manual local build worked for the backend services
- CLI/API validation worked
- kubeadm backend deployment worked
- portal login is intentionally not part of the release gate for this version

Known repo/application issues still outside the backend deployment success gate:
- frontend portal auth is still tied to Supabase in places
- frontend is not yet the production validation entrypoint
- business gateway route behavior should be rechecked whenever backend routes change
