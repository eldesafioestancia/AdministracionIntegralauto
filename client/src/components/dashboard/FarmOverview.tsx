interface FarmStats {
  livestock: number;
  pastures: number;
  machinery: number;
  investments: number;
}

interface FarmOverviewProps {
  stats: FarmStats;
}

export default function FarmOverview({ stats }: FarmOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-header font-semibold text-neutral-500">Vista General</h2>
        <button className="text-neutral-400 hover:text-neutral-500">
          <i className="ri-more-2-fill"></i>
        </button>
      </div>
      <div className="px-4 pt-4 pb-2">
        <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=337&q=80"
            alt="Vista aérea del campo"
            className="object-cover"
          />
        </div>

        <div className="flex flex-wrap -mx-2">
          <div className="w-1/2 px-2 mb-4">
            <div className="rounded overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1605654145610-2f65428be306?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
                alt="Ganado"
                className="w-full h-24 object-cover rounded"
              />
              <div className="mt-1">
                <h3 className="text-xs font-medium text-neutral-500">Ganado</h3>
                <p className="text-xs text-neutral-400">{stats.livestock} cabezas</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 px-2 mb-4">
            <div className="rounded overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1570976446041-b90812006a1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
                alt="Pasturas"
                className="w-full h-24 object-cover rounded"
              />
              <div className="mt-1">
                <h3 className="text-xs font-medium text-neutral-500">Pasturas</h3>
                <p className="text-xs text-neutral-400">{stats.pastures} hectáreas</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 px-2 mb-4">
            <div className="rounded overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1590529519539-b9c8f8a41435?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
                alt="Maquinaria"
                className="w-full h-24 object-cover rounded"
              />
              <div className="mt-1">
                <h3 className="text-xs font-medium text-neutral-500">Maquinaria</h3>
                <p className="text-xs text-neutral-400">{stats.machinery} unidades</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 px-2 mb-4">
            <div className="rounded overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1564984415016-a9f447efc2e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=200&q=80"
                alt="Inversiones"
                className="w-full h-24 object-cover rounded"
              />
              <div className="mt-1">
                <h3 className="text-xs font-medium text-neutral-500">Inversiones</h3>
                <p className="text-xs text-neutral-400">${stats.investments.toLocaleString()} total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
