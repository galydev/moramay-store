/**
 * Generic repository contract for a single Supabase-backed table.
 * Implementations MUST use the Supabase query builder (never concatenated
 * SQL) and MUST NOT leak Supabase-specific types outside the repository.
 */
export interface IRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(): Promise<ReadonlyArray<TEntity>>;
  create(entity: Partial<TEntity>): Promise<TEntity>;
  update(id: TId, changes: Partial<TEntity>): Promise<TEntity>;
}
