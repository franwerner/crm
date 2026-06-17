// Read-port for dedup queries against the contacts_channels table.
// Defined here (imports/application) so the imports slice never imports from modules/contacts.
// The adapter (infrastructure) queries the shared schema directly (no cross-slice import).
export interface ContactChannelLookup {
  /**
   * Returns true when at least one channel row already exists with the given
   * normalized email OR normalized phone (OR semantics, not AND — per R4.1).
   * Either argument may be undefined when the row has only one identity field.
   */
  existsByEmailOrPhone(email?: string, phone?: string): Promise<boolean>
}
